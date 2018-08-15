# Polarity Salesforce Integration

![image](https://img.shields.io/badge/status-beta-green.svg)

The Salesforce integration will search your Salesforce instance for email addresses that are recognized on your screen.
The integration will return any contacts and leads for the email address.  When viewing the contact or lead the integration
will also show related accounts, opportunities and tasks.

> The Salesforce integration requires Polarity Server 3.4+

## Installing the Integration

General installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

In addition to installing the integration on the server you will need to configure your Salesforce instance.

### Salesforce Configuration Steps

#### Add a Connected App

Before you can use the Polarity Salesforce Integration you will need to setup a Connected App in your salesforce
instance so Polarity can connect to it.  You can do this by navigating to `Setup` -> `Apps` -> `App Manager` and then
click on the `New Connected App` button.

Fill in the `Basic Information` section

![image](https://user-images.githubusercontent.com/306319/44168104-1573fd00-a09e-11e8-9087-4e779cd46e43.png)

Make sure to check the box next to `Enable OAuth Settings`.

Under `Enable OAuth Settings` you should add `Access and manage your data (api)` as the `Selected OAuth Scope`

![image](https://user-images.githubusercontent.com/306319/44168012-c75ef980-a09d-11e8-935a-b51c0f47a5f3.png)

Finally check `Require Secret for Web Service Flow`

![image](https://user-images.githubusercontent.com/306319/44168057-ed849980-a09d-11e8-92bf-b692a1d20e6f.png)

No other options need to be set.  Save your Connected App.

#### Add Network Access for the Polarity Server

Next you should add the polarity server to your list of trusted IP ranges.  To do this navigate to
`Setup` -> `Security` -> `Network Access`.

Click on the `New` button and add the external IP address for your Polarity Server:

![image](https://user-images.githubusercontent.com/306319/44168803-6be23b00-a0a0-11e8-9ff2-da830d45659c.png)

Add the external IP address of your Polarity Server to the `Trusted IP Range`.

Once complete you can begin to configure the Salesforce options from within Polarity.

## Salesforce Integration Options

### URL

URL of the Salesforce instance to use including the schema (i.e., https://)

Example:

```
https://company.my.salesforce.com
```

### Consumer Key

The Consumer Key for the connected app.  You can find this information under your Connected App under
`Setup` -> `Apps` -> `App Manager` -> `Manage Connected Apps`.  Click on the Polarity Application dropdown
and select `View`.

![image](https://user-images.githubusercontent.com/306319/44169021-27a36a80-a0a1-11e8-9c0e-63d144fdfcbb.png)

Look for the `Consumer Key` value.

### Consumer Secret

The Consumer Secret for the connected app.  You can find this information under your Connected App under
`Setup` -> `Apps` -> `App Manager` -> `Manage Connected Apps`.  Click on the Polarity Application dropdown
and select `View`.

![image](https://user-images.githubusercontent.com/306319/44169021-27a36a80-a0a1-11e8-9c0e-63d144fdfcbb.png)

Look for the `Consumer Secret` value.

### Username

The username for the individual user that is connecting to Salesforce.

### Password

The password for the provided `username`.

### Blacklist Domains

A comma delimited list of domains to ignore when sending emails to Salesforce for lookup.  As an example,
if your companies email addresses are `company.com` you can ignore all of these email addresses by setting
this options's value to `company.com`.  Any emails ending in `company.com` will no longer be searched in Salesforce.

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making.  For more information about the Polarity platform please see:

https://polarity.io/
