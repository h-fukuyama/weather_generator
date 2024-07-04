//ヘルパー関数
import fs from 'fs';

//weekDataGeneratorでweather_cdを読み込みアプリの形式に合わせる
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
        } else if (day.weather_cd == 1) { //仕様書では3が雨
            day.weather_cd = '1'; //USEN側では4が雨
        } else if (day.weather_cd == 2) {//仕様書では4が雪
            day.weather_cd = '3'; //USEN側では5が雪
        } else if (day.weather_cd == 3) { //仕様書では3が雨
            day.weather_cd = '4'; //USEN側では4が雨
        } else if (day.weather_cd == 4) {//仕様書では4が雪
            day.weather_cd = '5'; //USEN側では5が雪
        } else {
            day.weather_cd = '不明';
        };
    })
    return weatherList;
}

//hourDataGeneratorでweather_cdを読み込みアプリの形式に合わせる
export const hourWeatherConverter = (weatherList) => {
    const convertedList = weatherList.map(weather_cd => {
        if (weather_cd == 2) {//仕様書では2がくもり
            return weather_cd = '3'; //USEN側では3がくもり
        } else if (weather_cd == 3) { //仕様書では3が雨
            return weather_cd = '4'; //USEN側では4が雨
        } else if (weather_cd == 4) {//仕様書では4が雪
            return weather_cd = '5'; //USEN側では5が雪
        } else {
            return weather_cd;
        }
    });
    return convertedList;
}

//入力値をアルファベットが大文字、2桁0詰めの16進数に変換する
export const hexConverter = (value) => {
    let hex = value.toString(16).toUpperCase();
    if (hex.length === 1) {
        hex = '0' + hex;
    }
    return hex;
}

//配列の要素のXORの１の補数を返す(全datファイルに必要)
export const generateBCC = (array) => {
    let xorResult = 0; // XORの初期値は0とする
    for (let value of array) {  // 配列の全ての値をXOR演算
        xorResult ^= parseInt(value, 16);
    }
    // ビットを反転させる,(0xFF(8bit)でマスク)
    const complement = ~xorResult & 0xFF;

    return complement.toString(16).toUpperCase();;
}

//ファイルを生成する
export const createFile = (path) => {
    // ファイルを作成または初期化する
    fs.writeFile(path, '', (err) => {
        if (err) {
            console.error('ファイルを作成または初期化できませんでした。', err);
            return;
        }
    });
}

//生成されているファイルに追記する
export const appendDataToFile = (filePath, dataArray) => {
    // 配列をスペースで区切られた文字列に変換
    const dataString = dataArray.join(' ');

    // ファイルに追記（改行を追加）
    fs.appendFile(filePath, dataString + '\n', (err) => {
        if (err) {
            console.error('Error writing to file', err);
        } else {
        }
    });
};

//現在のYYYYMMDDのString型を生成する
export const createYYYYMMDD = () => {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    return today.getFullYear().toString() + month + day;
}

//現在のYYYYMMDDHHのString型を生成する
export const createYYYYMMDDHH = () => {
    const today = new Date();
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const hour = ('0' + today.getHours()).slice(-2);
    return today.getFullYear().toString() + month + day + hour;
}

//Date型の入力値をYYYYMMDDHHのString型に修正する
export const formatDateToYYYYMMDDHH = (date) => {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるので+1
    const day = ('0' + date.getDate()).slice(-2);
    const hour = ('0' + date.getHours()).slice(-2);
    return `${year}${month}${day}${hour}`;
}

//String型のYYYYMMDDをDate型に戻して日付計算を行い、再びString型に変換する
export const addDaysToDate = (dateString, days) => {
    // 日付文字列を年、月、日に分割
    const year = parseInt(dateString.slice(0, 4), 10);
    const month = parseInt(dateString.slice(4, 6), 10) - 1; // 月は0から始まるため -1
    const day = parseInt(dateString.slice(6, 8), 10);

    const date = new Date(year, month, day); // Dateオブジェクトを作成
    date.setDate(date.getDate() + days); // 日付に日数を加算

    // 新しい日付をYYYYMMDD形式に変換
    const newYear = date.getFullYear();
    const newMonth = ('0' + (date.getMonth() + 1)).slice(-2); // 月は0から始まるため +1
    const newDay = ('0' + date.getDate()).slice(-2);
    return `${newYear}${newMonth}${newDay}`;
}