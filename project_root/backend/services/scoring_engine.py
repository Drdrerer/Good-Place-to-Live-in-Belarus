import numpy as np
import pandas as pd

IMPORTANCE_MAP = {
    "Очень важен": 5,
    "Важен": 4,
    "Средне важен": 3,
    "Не очень важен": 2,
    "Не важен": 1
}

CRITERIA_INFO = {
    "salary_rub": {
        "id": 1,
        "name": "Средняя зарплата (руб.)",
        "direction": "+",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 9.4",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "unemployment_pct": {
        "id": 2,
        "name": "Уровень безработицы (%)",
        "direction": "-",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 4.11",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "retail_turnover_per_capita_rub": {
        "id": 3,
        "name": "Товарооборот на душу (руб./чел.)",
        "direction": "+",
        "source": "Белстат — Внутренняя торговля и общественное питание",
        "url": "https://www.belstat.gov.by/ofitsialnaya-statistika/realny-sector-ekonomiki/vnutrennyaya-torgovlya/"
    },
    "living_space_sqm": {
        "id": 4,
        "name": "Обеспеченность жильем (кв. м/чел.)",
        "direction": "+",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 11.5",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "housing_amenities_pct": {
        "id": 5,
        "name": "Жилищный фонд (% с водопроводом и др.)",
        "direction": "+",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 11.3",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "density_people_sqkm": {
        "id": 6,
        "name": "Плотность населения (чел./кв. км)",
        "direction": "+",
        "source": "Вычисляется на основе численности населения (Белстат — Численность населения на 1 января 2026 г.) и площади района из ГИС",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "road_density": {
        "id": 7,
        "name": "Густота автодорог (км / 1000 кв. км)",
        "direction": "+",
        "source": "Вычисление графа автодорог через OpenStreetMap (Geofabrik Belarus)",
        "url": "https://download.geofabrik.de/europe/belarus.html"
    },
    "crime_rate_scaled": {
        "id": 8,
        "name": "Преступность (случаев / 100 тыс. чел.)",
        "direction": "-",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 12.3",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "doctors_per_10k": {
        "id": 9,
        "name": "Обеспеченность врачами (чел. / 10 тыс. чел.)",
        "direction": "+",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 6.3",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "emissions_ton_sqkm": {
        "id": 10,
        "name": "Выбросы в атмосферу (т/кв. км)",
        "direction": "-",
        "source": "Вычисляется на основе ИАС Белстата / Ежегодник «Регионы Республики Беларусь» 2.14 и площади района из ГИС",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "radiation_rank": {
        "id": 11,
        "name": "Радиационное загрязнение",
        "direction": "+",
        "source": "Перечень населенных пунктов в зонах радиоактивного загрязнения (МЧС / Департамент ЧАЭС)",
        "url": "https://mchs.gov.by/"
    },
    "kindergarten_crowding": {
        "id": 12,
        "name": "Численность детей в УО дошкольного образования на одно УО (100 чел.)",
        "direction": "+",
        "source": "Вычисляется на основе ИАС Белстата / Ежегодник «Регионы Республики Беларусь» 5.6 и 5.7",
        "url": "https://www.dataportal.belstat.gov.by/"
    },
    "pupils_per_teacher": {
        "id": 13,
        "name": "Численность учащихся на одного учителя в дневных УО среднего образования (чел./чел.)",
        "direction": "-",
        "source": "Интерактивная информационно-аналитическая система Белстата (ИАС) / Ежегодник «Регионы Республики Беларусь» 5.14",
        "url": "https://www.dataportal.belstat.gov.by/"
    }
}


def load_districts_data(filepath: str) -> pd.DataFrame:
    df = pd.read_excel(filepath)
    df = df[df["district_name"] != "г. Минск"].copy()
    return df.reset_index(drop=True)


def convert_importance_to_weights(user_preferences: dict) -> dict:
    numeric_scores = {}
    for col in CRITERIA_INFO:
        label = user_preferences.get(col, "Средне важен")
        if label not in IMPORTANCE_MAP:
            raise ValueError(f"Неизвестная категория важности: {label}")
        numeric_scores[col] = IMPORTANCE_MAP[label]

    total_score = sum(numeric_scores.values())
    if total_score <= 0:
        raise ValueError("Сумма баллов важности должна быть больше нуля.")

    return {col: v_i / total_score for col, v_i in numeric_scores.items()}


def verify_weights_sum(weights: dict, tolerance: float = 1e-6) -> tuple[bool, float]:
    total_weight = sum(weights.values())
    is_valid = abs(total_weight - 1.0) <= tolerance
    return is_valid, total_weight


def normalize_criteria_minmax(df: pd.DataFrame, criteria_meta: dict = CRITERIA_INFO) -> pd.DataFrame:
    df_norm = df.copy()

    for col, meta in criteria_meta.items():
        x = df_norm[col].astype(float)
        x_min = x.min()
        x_max = x.max()
        denom = x_max - x_min
        norm_col = f"S_{col}"

        if denom == 0:
            df_norm[norm_col] = 0.0
        elif meta["direction"] == "+":
            df_norm[norm_col] = 10.0 * (x - x_min) / denom
        elif meta["direction"] == "-":
            df_norm[norm_col] = 10.0 * (x_max - x) / denom
        else:
            raise ValueError(f"Некорректное направление критерия {col}: {meta['direction']}")

    return df_norm


def calculate_district_scores(df_norm: pd.DataFrame, weights: dict) -> pd.DataFrame:
    is_valid, total_w = verify_weights_sum(weights)
    if not is_valid:
        raise ValueError(f"Ошибка контроля весов: сумма равна {total_w:.4f}, ожидается 1.0")

    df_result = df_norm.copy()
    r_values = np.zeros(len(df_result), dtype=float)

    for col, w_i in weights.items():
        r_values += w_i * df_result[f"S_{col}"].to_numpy()

    df_result["R_score"] = np.round(r_values, 2)
    df_result["rank"] = df_result["R_score"].rank(ascending=False, method="min").astype(int)
    df_result = df_result.sort_values(by=["rank", "R_score", "district_name"], ascending=[True, False, True])

    return df_result.reset_index(drop=True)


def get_top10_summary(df_ranked: pd.DataFrame) -> pd.DataFrame:
    cols = ["rank", "district_id", "oblast", "district_name", "R_score"]
    return df_ranked[cols].head(10).copy()


def get_full_detailed_table(df_ranked: pd.DataFrame) -> pd.DataFrame:
    base_cols = ["rank", "district_id", "oblast", "district_name", "R_score"]
    norm_cols = [f"S_{col}" for col in CRITERIA_INFO]
    raw_cols = list(CRITERIA_INFO.keys())
    return df_ranked[base_cols + norm_cols + raw_cols].copy()


def get_criteria_reference_table() -> pd.DataFrame:
    rows = []
    for col, meta in CRITERIA_INFO.items():
        rows.append({
            "№": meta["id"],
            "Код поля": col,
            "Критерий": meta["name"],
            "Направление": meta["direction"],
            "Источник": meta["source"],
            "Ссылка": meta["url"]
        })
    return pd.DataFrame(rows)


if __name__ == "__main__":
    df_raw = load_districts_data("districts_stats_full.xlsx")
    user_prefs = {col: "Средне важен" for col in CRITERIA_INFO}
    weights = convert_importance_to_weights(user_prefs)
    df_normalized = normalize_criteria_minmax(df_raw)
    df_ranked = calculate_district_scores(df_normalized, weights)
    print(get_top10_summary(df_ranked).to_string(index=False))