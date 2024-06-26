
export const weatherConverter = (weatherList) => {
    weatherList.forEach(day => { //https://weather.yukigesho.com/code.htmlの記事を参考にweather_cdを５分割
        if (day.weather_cd == 100) { //100: 晴れ
            day.weather_cd = '1';
        } else if (day.weather_cd > 100 && day.weather_cd < 200) { //100~199: 晴れ/曇り
            day.weather_cd = '3';
        } else if (day.weather_cd >= 200 && day.weather_cd < 300) { //200~299: くもり
            day.weather_cd = '2';
        } else if (day.weather_cd >= 300 && day.weather_cd < 400) { //300~399: 雨
            day.weather_cd = '4';
        } else if (day.weather_cd >= 400 && day.weather_cd <= 450) { //400~450: 雪
            day.weather_cd = '5';
        } else {
            // console.log(day.weather_cd);
            return 'Error';
        }
    })
    return weatherList;
}



export const hourWeatherConverter = (weatherList) => {
    const convertedList = weatherList.map(hour => {
        if (hour == 2) {
            return hour='3';
        } else if (hour == 3) {
            return hour='4';
        } else {
            return hour;
        }
    });
    return convertedList;
}


export const hexConverter = (value) => {
    let hex = value.toString(16).toUpperCase();
    if (hex.length === 1) {
        hex = '0' + hex;
    }
    return hex;
}

export const generateBCC = (array) => {
        let xorResult = 0; // XORの初期値は0とする
        for (let value of array) {  // 配列の全ての値をXOR演算
            xorResult ^= parseInt(value,16);
        }
        // ビットを反転させる,(0xFF(8bit)でマスク)
        const complement = ~xorResult & 0xFF;
    
        return complement.toString(16).toUpperCase();;
}

import fs from 'fs';
export const createFile = (path) => {
    // ファイルを作成または初期化する
    fs.writeFile(path, '', (err) => {
        if (err) {
            console.error('ファイルを作成または初期化できませんでした。', err);
            return;
        }
    });
}

export const appendDataToFile = (filePath, dataArray) => {
    // 配列をスペースで区切られた文字列に変換
    const dataString = dataArray.join(' ');

    // ファイルに追記（改行を追加）
    fs.appendFile(filePath, dataString + '\n', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
            // console.log('Data successfully appended to file');
        }
    });
};

export const createYYYYMMDD = () => {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return today.getFullYear().toString() + month + day;
}

export const createYYYYMMDDHH = () => {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const hour = ('0' + today.getHours()).slice(-2);
    return today.getFullYear().toString() + month + day + hour;
}

export const createDateFromYYYYMMDDHH = (yyyymmddhh) => {
    const year = parseInt(yyyymmddhh.substring(0, 4));
    const month = parseInt(yyyymmddhh.substring(4, 6)) - 1; // JavaScriptの月は0から始まる
    const day = parseInt(yyyymmddhh.substring(6, 8));
    const hour = parseInt(yyyymmddhh.substring(8, 10));
    return new Date(year, month, day, hour);
}

export const formatDateToYYYYMMDDHH = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので+1
    const day = ('0' + date.getDate()).slice(-2);
    const hour = ('0' + date.getHours()).slice(-2);
    return `${year}${month}${day}${hour}`;
}

export const addDaysToDate = (dateString, days) => {
    // 日付文字列を年、月、日に分割
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1; // 月は0から始まるため -1
    const day = parseInt(dateString.slice(6, 8), 10);
  
    // Dateオブジェクトを作成
    const date = new Date(year, month, day);
  
    // 日付に日数を加算
    date.setDate(date.getDate() + days);
  
    // 新しい日付をYYYYMMDD形式に変換
    const newYear = date.getFullYear();
    const newMonth = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるため +1
    const newDay = ('0' + date.getDate()).slice(-2);
  
    return `${newYear}${newMonth}${newDay}`;
  }