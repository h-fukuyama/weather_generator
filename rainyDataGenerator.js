import axios from 'axios';
import * as func from './weatherConverter.mjs';
import { appendDataToFile, generateBCC, hexConverter } from './weatherConverter.mjs';

export const fetchAndExtractRainyData = async (baseURL, headers, area, rainyHoursList) => {
    try {
        const promises = rainyHoursList.map(async (hour) => {
            const params = {
                area: '',
                zip: area.zipCode,
                mode: 'hour',
                from: hour,
                to: hour
            };
            try {
                const response = await axios.get(baseURL, { params, headers });
                return response.data.data;
            } catch (error) {
                console.error(`Error fetching data for hour ${hour}:`, error);
                return null; // エラーが発生した場合はnullを返す
            }
        });

        const weatherDataList = await Promise.all(promises);
        const rainyValuesList = weatherDataList.map(data => {
            if (data) {
                const key = Object.keys(data)[0]; // 各オブジェクトのキー（日時）を取得
                return {
                    rainy: data[key].rainy, // `rainy` の値を取得
                    weather_cd: data[key].weather_cd // `weather_cd` の値を取得
                };
            } else {
                return { rainy: 'No data', weather_cd: 'No data' }; // データがない場合のデフォルト値
            }
        });

        return rainyValuesList; // `rainy` と `weather_cd` のリストを返す
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return Array(rainyHoursList.length).fill({ rainy: 'No data', weather_cd: 'No data' }); // エラーが発生した場合のデフォルト値のリスト
    }
};


export const rainyDataGenerator = (rainyList, areaCode) => {
    let data = [] //パターンコード, 降水確率1,2,3,4
    const date = new Date();
    const nowHour = date.getHours();
    if (nowHour >= 0 && nowHour < 6) { //パターンコード05H
        data = [
            '05', 
            rainyList[0].weather_cd === 4 ? 2+getValue(rainyList[0].rainy) : 0+getValue(rainyList[0].rainy), 
            rainyList[1].weather_cd === 4 ? 2+getValue(rainyList[1].rainy) : 0+getValue(rainyList[1].rainy), 
            rainyList[2].weather_cd === 4 ? 2+getValue(rainyList[2].rainy) : 0+getValue(rainyList[2].rainy), 
            rainyList[3].weather_cd === 4 ? 2+getValue(rainyList[3].rainy) : 0+getValue(rainyList[3].rainy)            
        ]
    } else if (nowHour >= 6 && nowHour < 9) { //パターンコード01H
        data = [
            '01', 
            rainyList[2].weather_cd === 4 ? 2+getValue(rainyList[2].rainy) : 0+getValue(rainyList[2].rainy), 
            rainyList[3].weather_cd === 4 ? 2+getValue(rainyList[3].rainy) : 0+getValue(rainyList[3].rainy), 
            'FF',
            'FF'             
        ]
    } else if (nowHour >= 9 && nowHour < 12) { //パターンコード02H
        data = [
            '02', 
            rainyList[2].weather_cd === 4 ? 2+getValue(rainyList[2].rainy) : 0+getValue(rainyList[2].rainy), 
            rainyList[3].weather_cd === 4 ? 2+getValue(rainyList[3].rainy) : 0+getValue(rainyList[3].rainy), 
            rainyList[4].weather_cd === 4 ? 2+getValue(rainyList[4].rainy) : 0+getValue(rainyList[4].rainy), 
            'FF'             
        ]
    } else if (nowHour >= 12 && nowHour < 18) { //パターンコード03H
        data = [
            '03', 
            rainyList[3].weather_cd === 4 ? 2+getValue(rainyList[3].rainy) : 0+getValue(rainyList[3].rainy), 
            rainyList[4].weather_cd === 4 ? 2+getValue(rainyList[4].rainy) : 0+getValue(rainyList[4].rainy), 
            rainyList[5].weather_cd === 4 ? 2+getValue(rainyList[5].rainy) : 0+getValue(rainyList[5].rainy), 
           'FF'             
        ]        
    } else if (nowHour >= 18 && nowHour < 24) { //パターンコード04H
        data = [
            '04', 
            rainyList[4].weather_cd === 4 ? 2+getValue(rainyList[4].rainy) : 0+getValue(rainyList[4].rainy), 
            rainyList[5].weather_cd === 4 ? 2+getValue(rainyList[5].rainy) : 0+getValue(rainyList[5].rainy), 
            rainyList[6].weather_cd === 4 ? 2+getValue(rainyList[6].rainy) : 0+getValue(rainyList[6].rainy), 
            rainyList[7].weather_cd === 4 ? 2+getValue(rainyList[7].rainy) : 0+getValue(rainyList[7].rainy),             
        ]
    } else {
        return '不明';
    }
    data.unshift('E1', '05', '06', areaCode);
    data.push(hexConverter(generateBCC(data.slice(3,9))), 'E2');
    appendDataToFile(process.env.RAIN_DATA_PATH, data);       
}

const getValue = (input) => {
    if (input == 100) {
        return 'A';
    } else if (input >= 0 && input <= 9) {
        return '0';
    } else if (input > 9 && input < 100) {
        return Math.floor(input / 10).toString();
    } else {
        return '不明';
    }
}

export const concatRainyList = () => {
    let today = [];
    let tomorrow = [];
    const array = ['00', '06', '12', '18'];
    array.map(hour => {
        const newDateToday = func.createYYYYMMDD();
        today.push(newDateToday + hour);
        const newDateTomorrow = (parseInt(func.createYYYYMMDD()) + 1).toString()
        tomorrow.push(newDateTomorrow + hour)
    })
    return today.concat(tomorrow);
}