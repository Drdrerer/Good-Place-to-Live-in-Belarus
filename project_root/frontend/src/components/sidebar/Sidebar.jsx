/**
 * Компонент боковой панели управления критериями и весовыми коэффициентами.
 */
import React from 'react';

const IMPORTANCE_LEVELS = [
    'Очень важен',
    'Важен',
    'Средне важен',
    'Не очень важен',
    'Не важен'
];

const Sidebar = ({ 
    criteriaList = [], 
    userPreferences, 
    onPreferenceChange, 
    numericWeights, 
    onNumericWeightChange,
    isAdvancedMode, 
    setIsAdvancedMode 
}) => {
    return (
        <div className="flex flex-col h-full p-4 bg-white">
            <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">Критерии оценки</h2>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-600 font-medium">Режим управления:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={isAdvancedMode}
                            onChange={(e) => setIsAdvancedMode(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-2 text-xs font-semibold text-gray-700">
                            {isAdvancedMode ? 'Расширенный' : 'Базовый'}
                        </span>
                    </label>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {criteriaList.map((crit) => {
                    const code = crit['Код поля'];
                    const name = crit['Критерий'];
                    const direction = crit['Направление'];

                    return (
                        <div key={code} className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <div className="flex items-start justify-between mb-1">
                                <label className="text-xs font-semibold text-gray-800 leading-tight">
                                    {name}
                                </label>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    direction === '+' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {direction === '+' ? 'Макс.' : 'Мин.'}
                                </span>
                            </div>

                            {!isAdvancedMode ? (
                                <select
                                    value={userPreferences[code] || 'Средне важен'}
                                    onChange={(e) => onPreferenceChange(code, e.target.value)}
                                    className="mt-2 w-full text-xs bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {IMPORTANCE_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="mt-2 flex items-center space-x-3">
                                    {/* отдельный контейнер для ползунка и числовых меток */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={numericWeights[code] ?? 50}
                                            onChange={(e) => onNumericWeightChange(code, Number(e.target.value))}
                                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 m-0"
                                        />
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 px-0.5 select-none font-mono">
                                            <span className="w-4 text-left">0</span>
                                            <span className="w-6 text-center">50</span>
                                            <span className="w-6 text-right">100</span>
                                        </div>
                                    </div>

                                    {/* поле ручного числового ввода */}
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={numericWeights[code] ?? 50}
                                        onChange={(e) => onNumericWeightChange(code, Number(e.target.value))}
                                        className="w-12 h-7 text-xs border border-gray-300 rounded p-1 text-center font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;