/**
 * Компонент интерактивной хороплет-карты с карточками районов.
 */
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = ({ selectedDistrict, onDistrictSelect, districtsData = [] }) => {
    const [geoData, setGeoData] = useState(null);

    // загрузка геометрии районов республики беларусь
    useEffect(() => {
        fetch('/data/districts.geojson')
            .then(response => response.json())
            .then(data => setGeoData(data))
            .catch(error => console.error('Ошибка загрузки геоданных:', error));
    }, []);

    // поиск данных выбранного района для отображения информационной карточки
    const activeDistrictInfo = districtsData.find(d => d.district_id === selectedDistrict);

    // цветовая дифференциация районов на основе итогового балла от 1 до 10
    const getStyle = (feature) => {
        const districtId = feature.properties.district_id;
        const districtInfo = districtsData.find(d => d.district_id === districtId);
        const score = districtInfo ? districtInfo.R_score : 0;
        
        let fillColor = '#cbd5e1';
        if (score >= 8) fillColor = '#15803d';
        else if (score >= 6.5) fillColor = '#22c55e';
        else if (score >= 5) fillColor = '#eab308';
        else if (score >= 3.5) fillColor = '#f97316';
        else if (score > 0) fillColor = '#ef4444';
        
        const isSelected = selectedDistrict === districtId;

        return {
            fillColor: fillColor,
            weight: isSelected ? 3 : 1,
            opacity: 1,
            color: isSelected ? '#1d4ed8' : '#ffffff',
            fillOpacity: isSelected ? 0.9 : 0.65
        };
    };

    const onEachFeature = (feature, layer) => {
        const districtName = feature.properties.district_name;
        const districtId = feature.properties.district_id;
        
        layer.bindTooltip(districtName, { permanent: false, direction: 'auto' });
        
        layer.on({
            click: () => {
                onDistrictSelect(districtId);
            }
        });
    };

    return (
        <div className="h-full w-full relative z-0">
            {geoData ? (
                <MapContainer 
                    center={[53.7098, 27.9534]} 
                    zoom={7} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <GeoJSON 
                        data={geoData} 
                        style={getStyle}
                        onEachFeature={onEachFeature}
                        key={`${selectedDistrict}-${districtsData.length}`}
                    />
                </MapContainer>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Загрузка картографических данных...</p>
                </div>
            )}

            {/* всплывающая информационная карточка выбранного района */}
            {activeDistrictInfo && (
                <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-72">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-800 text-base">{activeDistrictInfo.district_name}</h3>
                        <button 
                            onClick={() => onDistrictSelect(null)}
                            className="text-gray-400 hover:text-gray-600 font-bold"
                        >
                            &times;
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{activeDistrictInfo.oblast} область</p>
                    <div className="flex justify-between items-center bg-blue-50 p-2 rounded mb-2">
                        <span className="text-xs font-medium text-blue-900">Итоговый балл:</span>
                        <span className="text-base font-bold text-blue-700">{activeDistrictInfo.R_score} / 10</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>Место в общем рейтинге:</span>
                        <span className="font-semibold text-gray-900">{activeDistrictInfo.rank} из {districtsData.length}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapView;