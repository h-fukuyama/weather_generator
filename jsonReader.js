//メイン実行関数。対応表の読み込み, APIリクエスト実行, datファイル生成

import * as func from './helperFunction.mjs';
import fs from 'fs';
import env from 'dotenv';
env.config();

import { performance } from 'perf_hooks';
import { temperatureDataGenerator } from './temperatureDataGenerator.js';
import { generateParamsDay, weekDataGenerator, fetchAndExtractWeekData } from './weekDataGenerator.js';
import { hourDataGenerator, hoursListGenerator, fetchAndExtractHourData } from './hourDataGenerator.js';
import { fetchAndExtractRainyData, rainyDataGenerator, concatRainyList } from './rainyDataGenerator.js';

const start = performance.now(); //実行時間記録用変数
const baseURL = process.env.BASE_URL; //APIのホストURL
const outputDir = process.env.OUTPUT_DIR; //完成ファイルの転送先
const headers = { 'x-api-key': process.env.API_KEY }; //headersに必要な変数(U members IDはoptionalだったため省略)

//ファイルの生成
const filePaths = [process.env.WEEK_DATA_PATH, process.env.HOUR_DATA_PATH, process.env.RAIN_DATA_PATH, process.env.TEMPERATURE_DATA_PATH, process.env.WARNING_DATA_PATH];
filePaths.forEach(path => func.createFile(path));

fs.readFile(process.env.ZIP_CODE_DATA_PATH, 'utf8', async (err, jsonString) => { //Area CodeとZip Codeの対応表(json)を読み込む
    if (err) { //対応表を読み込めなかった時のエラー処理
        console.error('Error reading file:', err);
        return;
    }
    try { //JSONをparseしてエリアごとにfor処理
        const data = JSON.parse(jsonString);
        for (const area of data.area) { //area.areaCode, area.zipCode

            //APIパラメータに含める日付/時間のリストを現在の時間を元に生成
            const paramsDay = generateParamsDay(area) //今日から７日後までのmode=dayの天気を取得するためのパラメータfrom,to
            const hoursList = hoursListGenerator(); //3,6,9,12,24,36,48時間後のYYYYMMDDHHリスト
            const rainyHoursList = concatRainyList(); //今日,明日の0,6,12,18時のYYYYMMDDHHリスト

            try {
                //APIから天気データの必要な情報のみを抽出・整形
                const hourList = await fetchAndExtractHourData(baseURL, headers, area, hoursList); //7個分のweather_cdのオブジェクトデータ(mode=hour)
                const rainyList = await fetchAndExtractRainyData(baseURL, headers, area, rainyHoursList); //8個分のrainy,weather_cdのオブジェクトデータ(mode=hour)
                const weekList = await fetchAndExtractWeekData(baseURL, headers, paramsDay); //8個分のweather_cd,max_temperature,min_temperatureのオブジェクトデータ(mode=day)

                //上記で生成されたデータをもとにdatファイルへの追記
                hourDataGenerator(hourList, area.areaCode); //jikan.dat生成(01)
                weekDataGenerator(weekList, area.areaCode); //syuukan.dat生成(02)
                temperatureDataGenerator(weekList, area.areaCode); //kion.dat生成(03)
                rainyDataGenerator(rainyList, area.areaCode); //kousui.dat生成(05)

            } catch (error) { console.error('Error fetching the data:', error); } //天気データ取得～datファイル生成まででのエラー時の処理    
        }
        // 生成されたファイルを別のフォルダに転送
        try {
            await Promise.all(filePaths.map(async (path) => {
                const fileName = path.split('/').pop();
                const destPath = `${outputDir}/${fileName}`;
                await fs.promises.rename(path, destPath);
            }));
        } catch (error) { console.error('Error moving files:', error); }
    } catch (err) { console.error('Error parsing JSON:', err); } //対応表のparse時に起きたエラーの処理

    const end = performance.now(); //実行時間計測用変数
    const duration = (end - start) / 1000; //実行時間計測用変数
    console.log(`Execution time: ${duration.toFixed(3)} seconds`);
});