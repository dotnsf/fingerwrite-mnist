# fingerwrite-mnist

## Overview

Identify finger-written digit image as number with IBM Watson.

## Pre-requisites

Follow and complete this page, and generate Web Service(REST API) to identify digit image as number.

https://qiita.com/ishida330/items/b093439a1646eba0f7c6


## Settings

- Edit settings.js with your own IBM Watson Service instance:

    - exports.wml_url: **url** value of service credential information in IBM Watson Machine Learning service instance

        - Usually this value would be **https://ibm-watson-ml.mybluemix.net**

    - exports.wml_username: **username** value of service credential information in IBM Watson Machine Learning service instance

    - exports.wml_password: **password** value of service credential information in IBM Watson Machine Learning service instance

    - exports.ws_endpoint: **Scoring End-point** from IBM Watson Studio service instance


- Install dependencies

    - `$ npm install`


## Run

- Run application

    - `$ node app`


## Reference

https://qiita.com/ishida330/items/b093439a1646eba0f7c6

## Licensing

This code is licensed under MIT.

## Copyright

2018 K.Kimura @ Juge.Me all rights reserved.

