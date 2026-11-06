/**
 * Модальное окно детализированной сравнительной таблицы всех районов.
 */
import React, { useState } from 'react';

const FullTableModal = ({ 
    isOpen, 
    onClose, 
    fullData = [], 
    criteriaList = [], 
    selectedDistrict, 
    onDistrictSelect 
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    if (!isOpen) return null;

    const filteredRows = fullData.filter(row => 
        row.district_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.oblast.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full h-[95vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Полная сравнительная таблица районов</h2>
                        <p className="text-xs text-gray-500">Всего районов в выборке: {fullData.length}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            placeholder="Поиск района..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={onClose}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-gray-100 sticky top-0 border-b border-gray-200 z-10">
                            <tr>
                                <th className="p-2.5 font-semibold text-gray-700 border-r border-gray-200 text-center w-12">Ранг</th>
                                <th className="p-2.5 font-semibold text-gray-700 border-r border-gray-200 w-44">Район</th>
                                <th className="p-2.5 font-semibold text-gray-700 border-r border-gray-200 w-28">Область</th>
                                <th className="p-2.5 font-semibold text-blue-700 border-r border-gray-200 text-center w-20">Балл</th>
                                {criteriaList.map(crit => (
                                    <th key={crit['Код поля']} className="p-2.5 font-medium text-gray-600 border-r border-gray-200 min-w-[130px]">
                                        <div className="truncate" title={crit['Критерий']}>
                                            {crit['Критерий']}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRows.map(row => {
                                const isSelected = selectedDistrict === row.district_id;

                                return (
                                    <tr 
                                        key={row.district_id}
                                        onClick={() => {
                                            onDistrictSelect(isSelected ? null : row.district_id);
                                        }}
                                        className={`cursor-pointer transition-colors ${
                                            isSelected 
                                                ? 'bg-blue-100/90 font-medium hover:bg-blue-200/80 ring-1 ring-inset ring-blue-500' 
                                                : 'hover:bg-blue-50'
                                        }`}
                                    >
                                        <td className={`p-2.5 text-center font-bold border-r border-gray-200 ${
                                            isSelected ? 'text-blue-950' : 'text-gray-600'
                                        }`}>
                                            {row.rank}
                                        </td>
                                        <td className={`p-2.5 border-r border-gray-200 ${
                                            isSelected ? 'font-bold text-blue-950' : 'font-semibold text-gray-800'
                                        }`}>
                                            {row.district_name}
                                        </td>
                                        <td className={`p-2.5 border-r border-gray-200 ${
                                            isSelected ? 'text-blue-900' : 'text-gray-500'
                                        }`}>
                                            {row.oblast}
                                        </td>
                                        <td className={`p-2.5 text-center font-bold border-r border-gray-200 ${
                                            isSelected ? 'bg-blue-200/90 text-blue-950' : 'bg-blue-50/50 text-blue-600'
                                        }`}>
                                            {row.R_score}
                                        </td>
                                        {criteriaList.map(crit => {
                                            const code = crit['Код поля'];
                                            const scoreValue = row[`S_${code}`];
                                            return (
                                                <td 
                                                    key={code} 
                                                    className={`p-2.5 border-r border-gray-200 text-right font-mono ${
                                                        isSelected ? 'text-blue-950 font-semibold' : 'text-gray-600'
                                                    }`}
                                                >
                                                    {typeof scoreValue === 'number' ? scoreValue.toFixed(1) : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FullTableModal;