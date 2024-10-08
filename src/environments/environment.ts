// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  localSLApiUrl: "http://localhost:5001/sl-weather/api/sl",
  localWeatherApiUrl: "/v2.0/forecast/hourly",
  localClimacellHourlyApiUrl: "./assets/weather-climacell-mockdata.json",
  localClimacellDailyApiUrl: "./assets/weather-climacell-mock-daily.json",
  weatherApiKey: "<Weather-api-key>",
  localOpenWeatherOpenApiUrl: './assets/weather-openweather-mock.json',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
