//jikan.datファイルを生成するために必要なモジュール

import * as func from './helperFunction.mjs';
import axios from 'axios';

//1. 7つの時間分のmode=hourパラメータを取得するためのリスト生成
export const hoursListGenerator = () => { //'YYYYMMDDHH'のリスト型オブジェクト
    const baseDate = new Date();
    return [3, 6, 9, 12, 24, 36, 48].map(hours => {
        const newDate = new Date(baseDate);
        newDate.setHours(newDate.getHours() + hours); //現在の時間から〇時間後のDate型
        return func.formatDateToYYYYMMDDHH(newDate); //YYYYMMDDHHのstringを返す
    });
};

//2. APIにリクエストを送信し、weather_cdを取得する
export const fetchAndExtractHourData = async (baseURL, headers, area, hoursList) => {
    try {
        const promises = hoursList.map(async (hour) => {
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
        const weatherCdList = weatherDataList.map(data => {
            if (data) {
                const key = Object.keys(data)[0]; // 各オブジェクトのキー（日時）を取得
                return data[key].weather_cd; // `weather_cd` の値を取得
            } else {
                return 'No data'; // データがない場合のデフォルト値
            }
        });

        return weatherCdList; // `weather_cd` のリストを返す
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return Array(hoursList.length).fill('No data'); // エラーが発生した場合のデフォルト値のリスト
    }
};

//3. jikan.datファイルを生成する
export const hourDataGenerator = (hourList, areaCode) => {
    let data = [0, 0, 0, 0, 0];
    const formattedWeatherList = func.hourWeatherConverter(hourList);
    //2を3に変更, 3を4に変更(2はないことになる?質問事項に追記)

    formattedWeatherList.forEach(function (value, index) {
        data[value - 1] += 2 ** (6 - index);
    })
    const hexData = data.map(func.hexConverter); //16進数(2桁0詰め,upperCase)に変換
    hexData.unshift('E1', '01', '06', areaCode);//start code(固定), data id(気温予想は02固定), data no(データのバイト数で06固定), DATA 0(地域コード)
    hexData.push(func.hexConverter(func.generateBCC(hexData.slice(3, 9))), 'E2'); //DATA 0~DATA 5までのXORを取り、そのデータの1の補数, end code(固定)
    func.appendDataToFile(process.env.HOUR_DATA_PATH, hexData); //対象ファイルへ追記
}