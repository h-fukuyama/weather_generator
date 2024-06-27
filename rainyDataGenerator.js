//kousui.datファイルを生成するために必要なモジュール

import axios from 'axios';
import * as func from './helperFunction.mjs';
import { appendDataToFile, generateBCC, hexConverter } from './helperFunction.mjs';

//1. 今日,明日の0,6,12,18時のYYYYMMDDHHリストを生成
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

//2. APIにリクエストを送信し、rainyとweather_cdを取得する
export const fetchAndExtractRainyData = async (baseURL, headers, area, rainyHoursList) => {
    try {
        const promises = rainyHoursList.map(async (hour) => {
            //パラメータの定義, mode=hour
            const params = {
                area: '',
                zip: area.zipCode,
                mode: 'hour',
                from: hour,
                to: hour
            };
            try {
                //APIから天気データの取得
                const response = await axios.get(baseURL, { params, headers });
                return response.data.data;
            } catch (error) {
                console.error(`Error fetching data for hour ${hour}:`, error);
                return null; // エラーが発生した場合はnullを返す
            }
        });

        const weatherDataList = await Promise.all(promises); //全ての時間の天気データが順番に格納される
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

//3. kousui.datファイルを生成する
export const rainyDataGenerator = (rainyList, areaCode) => {
    const date = new Date();
    const nowHour = date.getHours();

    // 天気データの降水確率値を取得する関数
    const getRainyValue = (index) => {
        const { weather_cd, rainy } = rainyList[index] || {}; // rainyListの指定されたインデックスの値を取得
        return weather_cd === 4 ? 2 + getValue(rainy) : 0 + getValue(rainy); // weather_cdが4なら2を追加、それ以外は0を追加
    };

    let patternCode; // パターンコード
    let indices; // 各時間帯のインデックス

    // 現在の時刻に応じてパターンコードとインデックスを設定
    if (nowHour >= 0 && nowHour < 6) { // 0時から6時未満の場合
        patternCode = '05';
        indices = [0, 1, 2, 3]; // インデックスの配列
    } else if (nowHour >= 6 && nowHour < 9) { // 6時から9時未満の場合
        patternCode = '01';
        indices = [2, 3, 'FF', 'FF']; // 'FF'は固定値
    } else if (nowHour >= 9 && nowHour < 12) { // 9時から12時未満の場合
        patternCode = '02';
        indices = [2, 3, 4, 'FF'];
    } else if (nowHour >= 12 && nowHour < 18) { // 12時から18時未満の場合
        patternCode = '03';
        indices = [3, 4, 5, 'FF'];
    } else if (nowHour >= 18 && nowHour < 24) { // 18時から24時未満の場合
        patternCode = '04';
        indices = [4, 5, 6, 7];
    } else {
        return '不明'; // 時刻が不明な場合
    }

    // データ配列を生成
    const data = [
        'E1', '05', '06', areaCode, patternCode, // 固定データとパターンコード
        ...indices.map(index => index === 'FF' ? 'FF' : getRainyValue(index)), // インデックスに応じた降水確率値
        // チェックサムの生成と追加
        hexConverter(generateBCC([areaCode, patternCode, ...indices.map(index => index === 'FF' ? 'FF' : getRainyValue(index))])), 
        'E2'
    ];

    // データをファイルに追記
    appendDataToFile(process.env.RAIN_DATA_PATH, data);
};


//3.1 降水確率の10の位のみをString型で取得するヘルパー関数(100の場合はA)
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