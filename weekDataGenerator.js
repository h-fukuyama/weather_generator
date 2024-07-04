//syuukan.datファイルを生成するために必要なモジュール

import * as func from './helperFunction.mjs';
import axios from 'axios';
import { response } from 'express';
import moment from 'moment';

//1. 8日分のmode=dayデータを取得するためのパラメーター生成
export const generateParamsDay = (area) => {
    return {
        area: '',
        zip: area.zipCode, //string型
        mode: 'day',
        from: func.createYYYYMMDD(), //string型'20240101'
        to: func.addDaysToDate(func.createYYYYMMDD(), 7).toString() //string型'20240108'
    }
};

//2. APIにリクエストを送信し、weather_cd, max_temperature, min_temperatureを取得する
export const fetchAndExtractWeekData = async (baseURL, headers, paramsDay) => {
    try {
        //APIから天気データの取得
        const responseDay = await axios.get(baseURL, { params: paramsDay, headers });
        const weekWeatherData = responseDay.data.data;
        const weatherList = [];

        //String型のparamsdayをDate型に変換(日付計算を行うため)
        const startDate = moment(paramsDay.from, "YYYYMMDD");
        const endDate = moment(paramsDay.to, "YYYYMMDD");

        //day毎のweather_cd, max_temperature, min_temperatureをweatherListにオブジェクト形式でpush
        for (let currentDate = startDate; currentDate <= endDate; currentDate.add(1, 'days')) {
            const date = currentDate.format("YYYYMMDD");
            const dayData = weekWeatherData[date];
            // console.log(await getWeatherCodeFromHour(baseURL, headers, paramsDay.zip, date));
            let weatherItem;
            if (dayData) {
                weatherItem = {
                    weather_cd: dayData.weather_cd,
                    max_temperature: dayData.max_temperature,
                    min_temperature: dayData.min_temperature
                };
            } else { //API上に情報がない場合はNo dataをpushする
                // weather_cd: 'No data',
                // max_temperature: 'No data',
                // min_temperature: 'No data'
                weatherItem = await getWeatherCodeFromHour(baseURL, headers, paramsDay.zip, date);
            };
            weatherList.push(weatherItem);
        }
        return weatherList;
    } catch (error) { //天気データ取得中に何らかのエラーが起きた場合の処理、No dataをpushする。
        console.error('Error fetching week weather data:', error);
        const startDate = moment(paramsDay.from, "YYYYMMDD");
        const endDate = moment(paramsDay.to, "YYYYMMDD");
        const weatherList = [];

        for (let currentDate = startDate; currentDate <= endDate; currentDate.add(1, 'days')) {
            weatherList.push({
                weather_cd: 'No data',
                max_temperature: 'No data',
                min_temperature: 'No data'
            });
        }

        return weatherList; // エラーが発生した場合のデフォルト値のリスト
    }
};

//2.5 API上に情報が無かった場合(12時までの7日後予報)はmode=hourで7日後0時のweather_cdだけを取得する
async function getWeatherCodeFromHour (baseURL, headers, zipCode, date) {
    const hourParams = { 
        area: '',
        zip: zipCode, //string型
        mode: 'hour',
        from: date + '00', //string型
        to: date + '00'
    };

    try {
        const responseHour = await axios.get(baseURL, { params: hourParams, headers });
        const hourData = responseHour.data.data[date+'00'];

        return hourData ? {
            weather_cd: hourData.weather_cd,
            max_temperature: 'No Data',
            min_temperature: 'No Data',
        } : {
            weather_cd: 'No data',
            max_temperature: 'No data',
            min_temperature: 'No data',
        };
    } catch (e) {
        console.error('Error fetching hour weather data:', e);
        return {
            weather_cd: 'No data',
            max_temperature: 'No data',
            min_temperature: 'No data'
        };
    }
}

//3. syuukan.datファイルの生成
export const weekDataGenerator = (weatherList, areaCode) => {
    let data = [0, 0, 0, 0, 0]; //晴れ, 晴れ/曇り, 曇り, 雨, 雪に対応付け
    const formattedWeatherList = func.weatherConverter(weatherList); //weather_cd(100~450)を晴れ:1, 晴れ/曇り:2, 曇り:3, 雨:4, 雪:5に変換

    formattedWeatherList.forEach(function (value, index) {
        if (index != 0) { //今日の予想は必要ないためindex=0以外に対して実装
            data[value.weather_cd - 1] += 2 ** (7 - index); //data配列に各日の天気に対応する値を加算
        }
    });

    const hexData = data.map(func.hexConverter); //16進数(2桁0詰め,upperCase)に変換
    hexData.unshift('E1', '02', '06', areaCode);//start code(固定), data id(気温予想は02固定), data no(データのバイト数で06固定), DATA 0(地域コード)
    hexData.push(func.hexConverter(func.generateBCC(hexData.slice(3, 9))), 'E2'); //DATA 0~DATA 5までのXORを取り、そのデータの1の補数, end code(固定)
    func.appendDataToFile(process.env.WEEK_DATA_PATH, hexData); //対象ファイルへ追記
}
