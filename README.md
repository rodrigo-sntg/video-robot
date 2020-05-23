# Video Maker Robot


[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://github.com/rodrigo-sntg/video-robot)

This is a video maker robot, made create based on [Felipe Deschamps](https://www.youtube.com/watch?v=kjhu1LEmRpY&list=PLMdYygf53DP4YTVeu0JxVnWq01uXrLwHi&index=1) youtube series.

# Features And Knowledge
A list of things I've learned developing this project:
  - [Algorithmia](https://algorithmia.com/algorithms/web/WikipediaParser) library for machine learning, used for text analysis. 
  - Sentiment and Emotion analysis with [GotIt](https://gotit.ai/)
  - Sentences analysis using IBM's Watson Natural Language Understanding
  - Rendering with FFMPEG, Kdenlive and After Effects Based on templates
  - Using [Melt framework](https://www.mltframework.org/docs/buildscripts/) to render a video with a xml file.
  - Youtube automatic upload using OAuth2

It is also ready for:
  - Lex Analysis with [Lexrank](https://www.npmjs.com/package/lexrank)

# Requirements
    - [Git] (https://git-scm.com/)
    - [Node] (https://nodejs.org)
    - One of the followings for rendering the video:
        - [Kdenlive] (https://kdenlive.org/en/)
        - [Melt] (https://www.mltframework.org/docs/buildscripts/)
        - [FFMPEG] (https://ffmpeg.org/)
        - [After Effects] (https://www.adobe.com/br/products/aftereffects/free-trial-download.html)



# Instalation

By [Hebert Lima](https://github.com/hebertlima)


## Start ##
- Install [Node.js](https://nodejs.org/en/) 
- Configure [Git](https://git-scm.com/downloads)


![Start](https://i.imgsafe.org/cb/cb0daa65df.gif)

## Clonando o Repositório ##

```
git clone https://github.com/rodrigo-sntg/video-robot
cd video-robot
npm install
```

![Clone](https://i.imgsafe.org/ca/caed010086.gif)

## Api: Algorithmia ##
It is necessary an apiKey, you can get it on [Algorithmia](https://algorithmia.com/).
on Dashboard look for **Api Keys** e **copie**.

![Algorithmin](https://i.imgsafe.org/ba/ba1d23897c.gif)

put the the data in the folder **./credentials**, in a file named `algorithmia.json`, just like: **Algorithmia** na estrutura abaixo:
``` js
{
  "apiKey": "API_KEY_HERE"
}
```

## Api: Watson ##
You will also need the credentials from *Watson* in [IBM](https://cloud.ibm.com/login).
Look for **catalogue**, inside **IA** search for *Natural Language Understanding*

![IBM](https://i.imgsafe.org/ba/bab0fc4ecd.jpeg)

Click on create on the bottom of the page.
Once the service is created, you'll be redirected to a management page of the service. 
In the left side's menu, look for **Service Credentials** and then **Auto-generated service credentials**.
Then copy the *Credentials* like so:

![IBM](https://i.imgsafe.org/ba/bace46f16b.jpeg)

Put the file again in **./credentials** on a file name `watson-nlu.json`, like this:
``` js
{
  "apikey" : "...",
  "iam_apikey_description" : "...",
  "iam_apikey_name": "...",
  "iam_role_crn": "...",
  "iam_serviceid_crn": "...",
  "url": "..."
}
```

## Setup: Google Cloud Plataform ##
Before creating the api's we are going to need, it's necessary link our google's account with the [Google Cloud Plataform](https://cloud.google.com/), on the page of **Google Cloud Plataform** you'll click in **free trial period**:

![google-cloud](https://i.imgsafe.org/61/61ce83ca22.png)

 Check **Terms And Conditions**

![google-cloud-step1](https://i.imgsafe.org/62/621a2df511.png)

> Obs: It is important to remember that some resources from **Google Cloud Platform** are **paid**, but we are only going to use the free ones.

![google-cloud-pay](https://i.imgsafe.org/62/6253ce8142.jpeg)

## Creating the project ##

Now it is time to create the project and link it to the api's.
To do so, just click on the top of the page "**Select Project**" and then click in "**New Project**":


![image](https://user-images.githubusercontent.com/34013325/55571155-52e3d400-56db-11e9-998f-bd99ab647403.png)


give it a name and click on the button **create:**

![image](https://user-images.githubusercontent.com/34013325/55571267-963e4280-56db-11e9-9b21-7f028caa05c1.png)

After that, the project will be created and after finished a menu will show with the project we just created and then, you must select it:

![image](https://user-images.githubusercontent.com/34013325/55571506-064cc880-56dc-11e9-804b-f14003dccc09.png)

## Api: Custom Search API ##

With the project created, we have to activate and configure the API.
Click on the left sit menu, navigate to **API's and Services** > **Library**:


![image](https://user-images.githubusercontent.com/34013325/55572521-22ea0000-56de-11e9-89cc-f477fe18bf65.png)

On the searsh bar, type **Custom Search API**, and click on **Enable**.
Wait the activation is finished.

![image](https://user-images.githubusercontent.com/34013325/55572661-78bea800-56de-11e9-9ae3-fbc87758aa84.png)

After thea ctivation, you have to create the credentials by clicking in **Create credentials**:

![image](https://user-images.githubusercontent.com/34013325/55572835-eb2f8800-56de-11e9-8292-fc3c4bf74084.png)

Search for **Custom Search API** on the dropdown and click in "**What credentials do I need?**"

![image](https://user-images.githubusercontent.com/34013325/55572958-2cc03300-56df-11e9-8bc1-17641ba5138e.png)

The you'll have your API KEY. Copy it and click on finish.
Go back to the project, on the **video-maker/credentials** folder and make a file called **google-search.json** like the example bellow:

```
{
  "apiKey": "API_KEY_HERE"
}
```


## Api: Custom Search Enginer ##
Now we have to configure the customized search engine. To do that, access [Custom Search Engine](https://cse.google.com/cse/create/new), and you'll have to inform the **search site** put **google.com**, and select the language.
Then click in **Advanced Options** and put the more generic schema **Thing**.
We are ready to go. Just click in **Create**:


> PS.: You can get more information about the schema here [schema.org](https://schema.org/docs/full.html)

![image](https://user-images.githubusercontent.com/34013325/55578410-38662680-56ec-11e9-80ea-06ff9e25ba3f.png)

Go to the **Control Panel** on the new screen and enable the option **Image Query**, then click on **Copy to clipboard**

![image](https://user-images.githubusercontent.com/34013325/55574756-8a567e80-56e3-11e9-99ea-d307547c781f.png)


![image](https://user-images.githubusercontent.com/34013325/55574920-0355d600-56e4-11e9-8f36-822a62224fab.png)

Back to the **google-search.json**, we have to create the a new property and paste the code copied before, with the id `searchEngineId`:

```
{
  "apiKey": "API_KEY_HERE",
  "searchEngineId": "ID_SEARCH_ENGINE"
}
```