/**
 * Компонент панели рейтинга районов (топ-10) с двусторонней синхронизацией.
 */
import React, { useState } from 'react';
import FullTableModal from './FullTableModal';

const Leaderboard = ({ selectedDistrict, onDistrictSelect, top10 = [], fullTable = [], criteriaList = [] }) => {
    const [isFullTableOpen, setIsFullTableOpen] = useState(false);

    return (
        <div className="flex flex-col h-full p-4 bg-white">
            <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Топ-10 районов</h2>
                <p className="text-xs text-gray-500">Лидеры по текущим критериям</p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {top10.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        Выполняется расчет рейтинга...
                    </div>
                ) : (
                    top10.map((item) => {
                        const isSelected = selectedDistrict === item.district_id;
                        return (
                            <div
                                key={item.district_id}
                                onClick={() => onDistrictSelect(isSelected ? null : item.district_id)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected 
                                        ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        item.rank === 1 ? 'bg-amber-100 text-amber-800' :
                                        item.rank === 2 ? 'bg-slate-200 text-slate-800' :
                                        item.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                        'bg-gray-200 text-gray-600'
                                    }`}>
                                        {item.rank}
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-gray-800 leading-tight">{item.district_name}</p>
                                        <p className="text-[10px] text-gray-500">{item.oblast} обл.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-blue-700">{item.R_score}</span>
                                    <span className="text-[10px] text-gray-400 block">балл</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="pt-4 border-t mt-2">
                <button
                    onClick={() => setIsFullTableOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                >
                    Открыть таблицу сравнения
                </button>
            </div>

            <FullTableModal
                isOpen={isFullTableOpen}
                onClose={() => setIsFullTableOpen(false)}
                fullData={fullTable}
                criteriaList={criteriaList}
                selectedDistrict={selectedDistrict}
                onDistrictSelect={onDistrictSelect}
            />
        </div>
    );
};

export default Leaderboard;