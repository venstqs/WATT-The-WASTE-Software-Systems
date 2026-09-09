import warnings
warnings.filterwarnings("ignore")

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import geopandas as gpd
import contextily as ctx
from shapely.geometry import Point, LineString
from pyproj import Transformer
import os

WGS84   = "EPSG:4326"
UTM51N  = "EPSG:32651"
WEBMERC = "EPSG:3857"

CITIES = {
    "Naga City":     {"lat": 13.6192, "lon": 123.1814},
    "Iriga City":    {"lat": 13.4225, "lon": 123.4086},
    "Legazpi City":  {"lat": 13.1391, "lon": 123.7438},
    "Daet":          {"lat": 14.1142, "lon": 122.9554},
}

TIERS = [
    {"id": 1, "label": "Tier 1: POC", "radius_m": 2500, "color": "#08519c"},
    {"id": 2, "label": "Tier 2: Pilot", "radius_m": 7000, "color": "#3182bd"},
    {"id": 3, "label": "Tier 3: City-Wide", "radius_m": 16000, "color": "#6baed6"},
]

city_gdf = gpd.GeoDataFrame(
    [{"name": k, **v, "geometry": Point(v["lon"], v["lat"])} for k, v in CITIES.items()],
    crs=WGS84
).to_crs(UTM51N)

tier_polys = []
naga_pt = city_gdf.loc[city_gdf["name"] == "Naga City", "geometry"].iloc[0]
for t in TIERS:
    tier_polys.append({
        "label": t["label"], "color": t["color"],
        "geometry": naga_pt.buffer(t["radius_m"])
    })
tiers_gdf = gpd.GeoDataFrame(tier_polys, crs=UTM51N).to_crs(WEBMERC)

def bezier_line(p1, p2, bend_m=20000, n=50):
    x1, y1 = p1
    x2, y2 = p2
    dx, dy = x2 - x1, y2 - y1
    perp_x = -dy / np.hypot(dx, dy) * bend_m
    perp_y =  dx / np.hypot(dx, dy) * bend_m
    mx = (x1 + x2) / 2 + perp_x
    my = (y1 + y2) / 2 + perp_y
    pts = [( (1-t)**2*x1 + 2*(1-t)*t*mx + t**2*x2, (1-t)**2*y1 + 2*(1-t)*t*my + t**2*y2 ) for t in np.linspace(0, 1, n)]
    return LineString(pts)

arcs = []
for city in ["Iriga City", "Legazpi City", "Daet"]:
    tgt = city_gdf.loc[city_gdf["name"] == city, "geometry"].iloc[0]
    bend = 20000 if city == "Daet" else -20000
    arcs.append({"geometry": bezier_line((naga_pt.x, naga_pt.y), (tgt.x, tgt.y), bend_m=bend)})
arcs_gdf = gpd.GeoDataFrame(arcs, crs=UTM51N).to_crs(WEBMERC)

city_web = city_gdf.to_crs(WEBMERC)

# Figure setup
fig = plt.figure(figsize=(12, 14), facecolor="white")
gs = fig.add_gridspec(2, 1, height_ratios=[3.5, 1], hspace=0.1)
ax = fig.add_subplot(gs[0])
ax_table = fig.add_subplot(gs[1])
ax_table.axis("off")

# Extent
transformer = Transformer.from_crs(WGS84, WEBMERC, always_xy=True)
x_min, y_min = transformer.transform(122.65, 13.0)
x_max, y_max = transformer.transform(124.0, 14.3)
ax.set_xlim(x_min, x_max)
ax.set_ylim(y_min, y_max)

# Base Map (CartoDB Positron for light theme)
ctx.add_basemap(ax, source=ctx.providers.CartoDB.Positron, alpha=1.0)

# Plot Tiers
for _, row in tiers_gdf[::-1].iterrows():
    gpd.GeoSeries([row.geometry]).plot(ax=ax, color=row["color"], alpha=0.15, edgecolor=row["color"], linewidth=1.5)

# Plot Expansion Arcs
arcs_gdf.plot(ax=ax, color="#cb181d", linewidth=1.5, linestyle="--", alpha=0.8)

# Plot Cities
for _, row in city_web.iterrows():
    is_naga = (row["name"] == "Naga City")
    color = "#08519c" if is_naga else "#cb181d"
    size = 200 if is_naga else 80
    marker = "*" if is_naga else "o"
    ax.scatter(row.geometry.x, row.geometry.y, s=size, color=color, marker=marker, edgecolors="white", zorder=5)
    offset_y = 6000 if is_naga else -8000
    ax.text(row.geometry.x, row.geometry.y + offset_y, row["name"], 
            fontsize=11, fontweight="bold" if is_naga else "normal", color="black", 
            ha="center", va="center", bbox=dict(facecolor="white", edgecolor="none", alpha=0.8, pad=2))

ax.set_title("Geospatial Scalability and Deployment Roadmap\nBicol Region, Philippines", fontsize=16, fontweight="bold", pad=15)
ax.axis("off")

# Legend
handles = [
    mpatches.Patch(facecolor="#08519c", alpha=0.3, edgecolor="#08519c", label="Tier 1: POC (Naga)"),
    mpatches.Patch(facecolor="#3182bd", alpha=0.3, edgecolor="#3182bd", label="Tier 2: Pilot (Naga)"),
    mpatches.Patch(facecolor="#6baed6", alpha=0.3, edgecolor="#6baed6", label="Tier 3: City-Wide (Naga)"),
    plt.Line2D([0], [0], color="#cb181d", linestyle="--", lw=1.5, label="Tier 4: Regional Expansion"),
]
ax.legend(handles=handles, loc="upper right", fontsize=10, framealpha=0.9, title="Deployment Tiers", title_fontproperties={'weight':'bold'})

# Data Table (Below Map)
table_data = [
    ["Tier 1: Proof of Concept", "Laboratory validation", "3 units", "16,950", "University lab testing, PANI coating optimization"],
    ["Tier 2: Pilot Deployment", "Single estero segment", "10 units", "42,000", "Naga City CDRRMO monitoring of 1 high-risk flood corridor"],
    ["Tier 3: City-Wide Network", "Full estero coverage", "50 units", "210,000", "Complete Naga River WQMA coverage (15 major esteros)"],
    ["Tier 4: Regional Expansion", "Bicol Region adoption", "200 units", "840,000", "Multi-city deployment (Naga, Iriga, Legazpi, Daet)"]
]
columns = ["Tier", "Scale", "Units", "Total Cost", "Target Deployment"]

table = ax_table.table(cellText=table_data, colLabels=columns, cellLoc="left", loc="center", bbox=[0, 0, 1, 1])
table.auto_set_font_size(False)
table.set_fontsize(10)

# Format table cells
for (i, j), cell in table.get_celld().items():
    if i == 0:
        cell.set_text_props(weight="bold", color="black")
        cell.set_facecolor("#f0f2f6")
    cell.set_edgecolor("#cccccc")
    cell.PAD = 0.05

out_png = r"c:\Projects SY 26-27\JA WE Challenge Files\bicol_deployment_map.png"
plt.savefig(out_png, dpi=300, bbox_inches="tight")
print(f"PNG saved successfully at {out_png}")
