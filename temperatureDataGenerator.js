//kion.datファイルを生成するためのモジュール、天気データはweekDataGeneratorで取得したものを使用。

import * as func from './helperFunction.mjs';

//weatherList[0]の今日,またはweatherList[1]の明日,のmax_temperatureとmin_temperatureを使用
export const temperatureDataGenerator = (weatherList, areaCode) => {
    let data = [0, 0]; //最低気温, 最高気温
    const date = new Date();
    const nowHour = date.getHours();
    let i = 0; //今日:0, 明日:1
    
    if (nowHour >= 15 && nowHour <= 23) { //15:00-23:59は明日の予報
        data = data.map(element => element + 128); //D7ビットに1(10進数で2^7=128)を加算
        i = 1; //明日の予報を取得するためiを加算
    }

    //それぞれ気温が-の場合D6ビットに1(10進数で2^6=64)を加算し、気温予想の絶対値を加算
    weatherList[i].max_temperature <= 0 ? data[1] += (64 - parseInt(weatherList[i].max_temperature, 10)) : data[1] += parseInt(weatherList[i].max_temperature, 10);
    weatherList[i].min_temperature <= 0 ? data[0] += (64 - parseInt(weatherList[i].min_temperature, 10)) : data[0] += parseInt(weatherList[i].min_temperature, 10);

    const hexData = data.map(func.hexConverter); //16進数(2桁0詰め,upperCase)に変換
    hexData.unshift('E1', '03', '03', areaCode); //start code(固定), data id(気温予想は03固定), data no(データのバイト数で03固定), DATA 0(地域コード)
    hexData.push(func.hexConverter(func.generateBCC(hexData.slice(3, 6))), 'E2'); //DATA 0~DATA 2までのXORを取り、そのデータの1の補数, end code(固定)
    func.appendDataToFile(process.env.TEMPERATURE_DATA_PATH, hexData); //対象ファイルへ追記
}