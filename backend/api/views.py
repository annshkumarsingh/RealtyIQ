import os
import re
import pandas as pd
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import openai


# ---------- CONFIG ----------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCEL_PATH = os.path.join(BASE_DIR, "uploads/uploaded_excel.xlsx")




# ---------- HELPERS ----------

def generate_llm_summary(area, metric, df):
    try:
        text = f"Write a short simple summary for real estate analysis.\nArea: {area}\nMetric: {metric}\nData:\n{df.to_string()}\n\nGive insights in 3-4 bullet points."
        
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": text}]
        )
        
        return response.choices[0].message["content"]
    except:
        return "Summary generated based on available data."

def is_count_metric(col_name: str) -> bool:
    return any(keyword in col_name.lower() for keyword in ["total", "inventory", "supply", "sales", "stock", "unit"])


def detect_area_column(df: pd.DataFrame) -> str:
    for col in df.columns:
        if col.lower().strip() in ["area", "locality", "location", "final location"]:
            return col
    return df.columns[0]


def extract_year(value) -> int | None:
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        try:
            return int(value)
        except Exception:
            return None
    match = re.search(r"(20\d{2})", str(value))
    return int(match.group(1)) if match else None


def n_years_filter(df: pd.DataFrame, query: str) -> pd.DataFrame:
    if "year" not in df.columns:
        return df

    # Convert all year values to integers if possible
    df = df.copy()
    df_years = pd.to_numeric(df["year"], errors="coerce")
    df = df[df_years.notna()]
    df["year"] = df_years.astype(int)

    query_lower = query.lower()
    available_years = sorted(df["year"].unique())

    # 1️⃣ Last/Past/Previous N years
    match_last = re.search(r"\b(?:last|past|previous)\s+(\d+)\s*(?:year|years|yr|yrs)\b", query_lower)
    if match_last:
        n = max(1, int(match_last.group(1)))
        selected = available_years[-n:] if n <= len(available_years) else available_years
        return df[df["year"].isin(selected)]

    # 2️⃣ First N years
    match_first = re.search(r"\bfirst\s+(\d+)\s*(?:year|years|yr|yrs)\b", query_lower)
    if match_first:
        n = max(1, int(match_first.group(1)))
        selected = available_years[:n]
        return df[df["year"].isin(selected)]

    # -----Explicit year(s) or ranges-----

    # Range type: 2018-20
    match_short_range = re.search(r"(20\d{2})-(\d{2})\b", query_lower)
    if match_short_range:
        y1 = int(match_short_range.group(1))
        y2_suffix = int(match_short_range.group(2))
        # Make the full year for y2: if y1=2022 and y2_suffix=23 => 2023
        y2 = (y1 // 100) * 100 + y2_suffix
        selected = [y for y in available_years if min(y1, y2) <= y <= max(y1, y2)]
        return df[df["year"].isin(selected)]
    
    # Range types: 2018-2020, 2018 to 2020
    match_range = re.search(r"(20\d{2})\s*(?:-|–|to)\s*(20\d{2})", query_lower)
    if match_range:
        y1, y2 = int(match_range.group(1)), int(match_range.group(2))
        selected = [y for y in available_years if min(y1, y2) <= y <= max(y1, y2)]
        return df[df["year"].isin(selected)]

    # Single year(s) mentioned
    explicit_years = sorted({int(y) for y in re.findall(r"(20\d{2})", query_lower) if int(y) in available_years})
    if explicit_years:
        return df[df["year"].isin(explicit_years)]

    # Default: return full DataFrame
    return df


def detect_column(df: pd.DataFrame, query: str) -> str:
    query_lower = query.lower()

    # --- 1. COLUMN CATEGORY KEYWORDS ---
    COLUMN_KEYWORDS = {
        "weighted_rate": ["weighted", "average", "avg", "price", "rate", "pricing", "cost"],
        "prevailing_rate": ["prevailing", "range"],
        "sold_units": ["sold", "sales", "demand", "absorption", "uptake"],
        "carpet_area": ["carpet", "sqft", "area", "measurement"],
        "total_units": ["stock", "unit", "inventory", "supply", "available", "listing"],
    }

    # --- 2. AREA TYPES ---
    AREA_TYPES = ["flat", "office", "shop", "others", "commercial", "residential"]

    # --- 3. MAP CATEGORY → POSSIBLE ACTUAL COLUMNS ---
    COLUMN_MAP = {
        "weighted_rate": [
            f"{area} - weighted average rate" for area in AREA_TYPES
        ],
        "prevailing_rate": [
            f"{area} - most prevailing rate - range" for area in AREA_TYPES
        ],
        "sold_units": [
            f"{area}_sold - igr" for area in AREA_TYPES
        ] + ["total_sales - igr", "total sold - igr"],
        "total_units": [
            "total units", "flat total", "shop total", "office total", "others total"
        ],
        "carpet_area": [
            "total carpet area supplied (sqft)"
        ],
    }

    # 1️⃣ Detect area type if mentioned (flat / shop / office...)
    detected_area = None
    for a in AREA_TYPES:
        if a in query_lower:
            detected_area = a
            break

    # 2️⃣ Detect keyword category (weighted rate / prevailing / sold / units...)
    detected_category = None
    for category, keywords in COLUMN_KEYWORDS.items():
        if any(kw in query_lower for kw in keywords):
            detected_category = category
            break

    # 3️⃣ If both area + category match → perfect match
    if detected_area and detected_category:
        for col in COLUMN_MAP[detected_category]:
            if col.startswith(detected_area):
                if col in df.columns:
                    return col

    # 4️⃣ If only category found → return the first matching existing column
    if detected_category:
        for col in COLUMN_MAP[detected_category]:
            if col in df.columns:
                return col

    # 5️⃣ Fallback: Use numeric columns except "year" and coordinates
    numeric_cols = [
        c for c in df.select_dtypes(include="number").columns
        if c.lower() not in ["year", "loc_lat", "loc_lng"]
    ]

    if numeric_cols:
        return numeric_cols[0]

    # 6️⃣ LAST RESORT: return first usable column
    return df.columns[0]


def safe_trend(df, metric_col):
    if df.empty or "year" not in df.columns or metric_col not in df.columns:
        return []
    try:
        trend = df.groupby("year")[metric_col].sum().reset_index()
        return trend[["year", metric_col]].to_dict(orient="records")
    except Exception:
        return []


def generate_trends(df: pd.DataFrame, metric_col: str) -> dict:
    numeric_cols = list(df.select_dtypes(include="number").columns)
    secondary_col = numeric_cols[1] if len(numeric_cols) > 1 else None

    if secondary_col:
        trend = df.groupby("year", as_index=False).agg({metric_col: "mean", secondary_col: "sum"})
        return {
            metric_col: trend[["year", metric_col]].to_dict(orient="records"),
            secondary_col: trend[["year", secondary_col]].to_dict(orient="records")
        }
    else:
        trend = df.groupby("year", as_index=False)[metric_col].mean()
        return {"metricTrend": trend[["year", metric_col]].to_dict(orient="records")}




# ---------- ROUTES ----------

@api_view(["POST"])
@parser_classes([MultiPartParser])
def upload_excel(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    os.makedirs(os.path.dirname(EXCEL_PATH), exist_ok=True)
    with open(EXCEL_PATH, "wb+") as f:
        for chunk in file.chunks():
            f.write(chunk)

    df = pd.read_excel(EXCEL_PATH)
    return Response({
        "message": "File uploaded and saved successfully",
        "path": EXCEL_PATH,
        "rows": len(df),
        "columns": list(df.columns)
    })

@api_view(["POST"])
def analyze(request):
    # Get query
    query = request.data.get("query", "")
    if not query:
        return Response({"error": "Query is required"}, status=400)

    # Read excel file
    try:
        df = pd.read_excel(EXCEL_PATH)
    except FileNotFoundError:
        return Response({"error": "No Excel file uploaded yet"}, status=500)

    # Detect Area column in the file
    area_col = detect_area_column(df)
    df[area_col] = df[area_col].astype(str)
    query_lower = query.lower()

    # List of all the areas mentioned in the query
    mentioned_areas = []
    for area in df[area_col].unique():
        pattern = r"\b" + re.escape(str(area).lower()).replace(" ", r"\s+") + r"\b"
        if re.search(pattern, query_lower):
            mentioned_areas.append(area)


    # Case 0: No Areas
    if not mentioned_areas:
        return Response({"error": "No matching area found"}, status=404)

    # Casee 1: One Area
    if len(mentioned_areas) == 1:
        area = mentioned_areas[0]
        filtered = n_years_filter(df[df[area_col].str.lower() == area.lower()], query)
        metric_col = detect_column(filtered, query)
        chart = generate_trends(filtered, metric_col)
        summary = f"{area}: Trend analysis based on '{metric_col}' extracted successfully."
        return Response({
            "summary": summary,
            "area": area,
            "chart": chart,
            "table": filtered.to_dict(orient="records")
        })

    # Case 2: Two Areas
    elif len(mentioned_areas) == 2:
        df1, df2 = [n_years_filter(df[df[area_col].str.lower() == a.lower()], query) for a in mentioned_areas]
        metric_col = detect_column(df1, query)
        if metric_col not in df1.columns:
            numeric_cols = list(df1.select_dtypes(include="number").columns)
            metric_col = numeric_cols[0] if numeric_cols else None

        trend1 = safe_trend(df1, metric_col)
        trend2 = safe_trend(df2, metric_col)
        summary = f"Comparison of {metric_col} between {mentioned_areas[0]} and {mentioned_areas[1]}."
        return Response({
            "summary": summary,
            "metric": metric_col,
            "areas": mentioned_areas,
            "comparison": {
                mentioned_areas[0]: trend1,
                mentioned_areas[1]: trend2
            },
            "table": pd.concat([df1, df2]).to_dict(orient="records")
        })

    # Case 3: Multiply Areas
    else:
        filtered_all = n_years_filter(df[df[area_col].str.lower().isin([a.lower() for a in mentioned_areas])], query)
        metric_col = detect_column(filtered_all, query)
        comparison = {}
        for area in mentioned_areas:
            temp = n_years_filter(df[df[area_col].str.lower() == area.lower()], query)
            comparison[area] = safe_trend(temp, metric_col)

        chart_data = [{"area": area, "data": comparison[area]} for area in mentioned_areas]
        summary = f"Comparison of '{metric_col}' across {len(mentioned_areas)} areas: {', '.join(mentioned_areas)}"
        filtered_rows = n_years_filter(
            df[df[area_col].str.lower().isin([a.lower() for a in mentioned_areas])],
            query
        )

        return Response({
            "summary": summary,
            "metric": metric_col,
            "areas": mentioned_areas,
            "chart": chart_data,
            "table": filtered_rows.to_dict(orient="records")
        })
