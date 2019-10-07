Note: Run commands in the root app directory. And obviously you don't need to run npm install all the time...

To install ZAT
===============
1) `gem install zendesk_apps_tools`

Compile the app for DEV
===============
1) `npm install`
1) `npm run watch`
1) `zat server -p dist` - Serves the app to your zendesk instance with `?zat=true`

Compile the app for PROD
===============
1) `npm install --only=production`
1) `zat translate to_json -p src`
1) `npm run build`
1) `zat package -p dist/` - This will output a .zip file to be uploaded to Zendesk's account at https://apps.zendesk.com.

To run linter
===============
1) `npm install`
1) `npm run lint`
