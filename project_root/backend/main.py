"""
Основной модуль серверной части приложения.
Реализует обработку запросов от клиентской части и взаимодействие с расчетным скриптом.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from services import scoring_engine

app = FastAPI(title="Система поиска наилучшего места для жизни")

# настройка cors для обеспечения кросс-доменных запросов от клиентского приложения
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# формирование абсолютного пути к директории с данными
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "districts_stats_full.xlsx")

# предварительная загрузка и нормализация данных в оперативной памяти при старте сервера
try:
    df_raw = scoring_engine.load_districts_data(DATA_PATH)
    df_normalized = scoring_engine.normalize_criteria_minmax(df_raw)
except Exception as e:
    df_normalized = pd.DataFrame()


class Preferences(BaseModel):
    """
    Модель валидации входящих данных для настроек важности критериев.
    """
    weights: dict[str, str]


@app.get("/api/criteria")
def get_criteria_info():
    """
    Возвращает справочник критериев для инициализации интерфейса боковой панели.
    """
    ref_table = scoring_engine.get_criteria_reference_table()
    return ref_table.to_dict(orient="records")


@app.post("/api/calculate")
def calculate_ranking(prefs: Preferences):
    """
    Принимает пользовательские настройки важности, инициирует перерасчет весов и возвращает рейтинги.
    """
    if df_normalized.empty:
        raise HTTPException(status_code=500, detail="Ошибка сервера: данные статистики не загружены.")
        
    try:
        numeric_weights = scoring_engine.convert_importance_to_weights(prefs.weights)
        df_ranked = scoring_engine.calculate_district_scores(df_normalized, numeric_weights)
        
        # формирование двух наборов данных согласно требованиям пользовательского интерфейса
        top10 = scoring_engine.get_top10_summary(df_ranked).to_dict(orient="records")
        full_table = scoring_engine.get_full_detailed_table(df_ranked).to_dict(orient="records")
        
        return {
            "top10": top10,
            "full_table": full_table
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception:
        raise HTTPException(status_code=500, detail="Внутренняя ошибка при расчете рейтинга.")