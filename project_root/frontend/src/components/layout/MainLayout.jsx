/**
 * Корневой макет интерфейса с централизованным управлением состоянием.
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../sidebar/Sidebar';
import MapView from '../map/MapView';
import Leaderboard from '../leaderboard/Leaderboard';

const API_BASE = 'http://localhost:8000';

const MainLayout = () => {
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const [criteriaList, setCriteriaList] = useState([]);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);
    
    // текстовые уровни важности для базового режима
    const [userPreferences, setUserPreferences] = useState({});
    
    // числовые веса (0-100) для расширенного режима
    const [numericWeights, setNumericWeights] = useState({});

    // результаты расчетов
    const [rankingData, setRankingData] = useState({ top10: [], full_table: [] });

    // первичная загрузка справочника критериев
    useEffect(() => {
        fetch(`${API_BASE}/api/criteria`)
            .then(res => res.json())
            .then(data => {
                setCriteriaList(data);
                const initialPrefs = {};
                const initialWeights = {};
                data.forEach(crit => {
                    const code = crit['Код поля'];
                    initialPrefs[code] = 'Средне важен';
                    initialWeights[code] = 50;
                });
                setUserPreferences(initialPrefs);
                setNumericWeights(initialWeights);
            })
            .catch(err => console.error('Ошибка соединения с API сервером:', err));
    }, []);

    // отправка запроса на расчет при изменении весов
    useEffect(() => {
        if (criteriaList.length === 0) return;

        let payloadWeights = {};

        if (!isAdvancedMode) {
            payloadWeights = userPreferences;
        } else {
            // преобразование числовых весов расширенного режима в текстовые эквиваленты
            Object.keys(numericWeights).forEach(key => {
                const val = numericWeights[key];
                if (val >= 80) payloadWeights[key] = 'Очень важен';
                else if (val >= 60) payloadWeights[key] = 'Важен';
                else if (val >= 40) payloadWeights[key] = 'Средне важен';
                else if (val >= 20) payloadWeights[key] = 'Не очень важен';
                else payloadWeights[key] = 'Не важен';
            });
        }

        fetch(`${API_BASE}/api/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weights: payloadWeights })
        })
            .then(res => res.json())
            .then(data => setRankingData(data))
            .catch(err => console.error('Ошибка при расчете рейтингов:', err));
    }, [userPreferences, numericWeights, isAdvancedMode, criteriaList]);

    const handlePreferenceChange = (field, value) => {
        setUserPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleNumericWeightChange = (field, value) => {
        setNumericWeights(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
            <aside className="w-[340px] h-full bg-white border-r border-gray-200 z-10">
                <Sidebar 
                    criteriaList={criteriaList}
                    userPreferences={userPreferences}
                    onPreferenceChange={handlePreferenceChange}
                    numericWeights={numericWeights}
                    onNumericWeightChange={handleNumericWeightChange}
                    isAdvancedMode={isAdvancedMode}
                    setIsAdvancedMode={setIsAdvancedMode}
                />
            </aside>
            
            <main className="flex-1 h-full relative">
                <MapView 
                    selectedDistrict={selectedDistrictId}
                    onDistrictSelect={setSelectedDistrictId}
                    districtsData={rankingData.full_table}
                />
            </main>
            
            <aside className="w-[320px] h-full bg-white border-l border-gray-200 z-10">
                <Leaderboard 
                    selectedDistrict={selectedDistrictId}
                    onDistrictSelect={setSelectedDistrictId}
                    top10={rankingData.top10}
                    fullTable={rankingData.full_table}
                    criteriaList={criteriaList}
                />
            </aside>
        </div>
    );
};

export default MainLayout;