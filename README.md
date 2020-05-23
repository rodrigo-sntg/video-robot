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
*******************************
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

## Creating the project ## **************

Agora é a hora de criarmos um projeto que iremos vincular as Api's que vamos utilizar, para isso basta clicar no menu do topo da página "**Selecionar projeto**" e depois em "**Novo Projeto**":

![image](https://user-images.githubusercontent.com/34013325/55571155-52e3d400-56db-11e9-998f-bd99ab647403.png)

de um nome ao projeto e clique no botão **criar:**

![image](https://user-images.githubusercontent.com/34013325/55571267-963e4280-56db-11e9-9b21-7f028caa05c1.png)

após isso o projeto começará a ser criado e assim que terminar um menu vai aparecer com o projeto que acabamos de criar então você irá seleciona-lo:

![image](https://user-images.githubusercontent.com/34013325/55571506-064cc880-56dc-11e9-804b-f14003dccc09.png)

## Api: Custom Search API ##

Com o projeto criado agora é hora de habilitarmos e configurarmos a Api, você irá clicar no menu lateral esquerdo no topo navegar até **API's e Serviços** > **Bibliotecas**:

![image](https://user-images.githubusercontent.com/34013325/55572521-22ea0000-56de-11e9-89cc-f477fe18bf65.png)

no campo de pesquisa basta procurar por **Custom Search API**, clicar em **Ativar**, e aguardar até a ativação da api:

![image](https://user-images.githubusercontent.com/34013325/55572661-78bea800-56de-11e9-9ae3-fbc87758aa84.png)

Após a ativação vai aparecer uma mensagem solicitando a criação das credenciais da API, então basta você clicar em **Criar Credenciais**:

![image](https://user-images.githubusercontent.com/34013325/55572835-eb2f8800-56de-11e9-8292-fc3c4bf74084.png)

Procure por **Custom Search API** no dropdown e clique em "**Preciso de quais credenciais?**"

![image](https://user-images.githubusercontent.com/34013325/55572958-2cc03300-56df-11e9-8bc1-17641ba5138e.png)

Após isso irá aparecer sua Api Key, você vai copia-la e clicar no botão concluir, voltando a pasta do projeto você vai navegar até **video-maker/credentials** e irá criar um novo arquivo chamado **google-search.json** com o conteúdo abaixo:

```
{
  "apiKey": "API_KEY_AQUI"
}
```

## Api: Custom Search Enginer ##
Agora iremos configurar o nosso motor de busca personalizado do google, para isso você vai acessar o [Custom Search Engine](https://cse.google.com/cse/create/new), e irá informar o **site a pesquisar** coloque **google.com**, ire selecionar o idioma que preferir *no vídeo o Filipe deixa Inglês então aconselho deixar em inglês*, e por fim clique em **Opções avançadas** e para o esquema iremos utilizar o mais genérico **Thing**, pronto tudo preenchido você irá clicar em **criar**:

> PS.: Para saber mais sobre o schema que o Filipe cita no vídeo acesse [schema.org](https://schema.org/docs/full.html)

![image](https://user-images.githubusercontent.com/34013325/55578410-38662680-56ec-11e9-80ea-06ff9e25ba3f.png)


Agora basta clicar em **Painel de Controle** na nova tela nós iremos habilitar a opção **Pesquisa de imagens** e depois iremos clicar no botão **Copiar para área de transferência**"

![image](https://user-images.githubusercontent.com/34013325/55574756-8a567e80-56e3-11e9-99ea-d307547c781f.png)

> Ps.: Existem diversas opções que eu aconselho futuramente você testar e descobrir o que cada uma dela faz 😋 

![image](https://user-images.githubusercontent.com/34013325/55574920-0355d600-56e4-11e9-8f36-822a62224fab.png)

Voltando no arquivo **google-search.json** iremos criar uma nova propriedade e iremos colar o código identificador do mecanismo de busca que criamos, identificado por `searchEngineId`, no final irá ficar assim:

```
{
  "apiKey": "API_KEY_AQUI",
  "searchEngineId": "ID_MECANISMO_DE_BUSCA"
}
```

## Api: YouTube ##

Chegou a hora de configurarmos a api do youtube!, como fizemos na api custom search iremos fazer o mesmo com a api do YoutTube, então basta acessar o [Google Cloud](https://cloud.google.com/) e habilitar o serviço do YouTube, clicando no menu Lateral **Apis e Serviços -> Biblioteca**, na caixa de pesquisa procure por **YouTube**, e click no botão Ativar: 

![ezgif-5-fa13fd3c8407](https://user-images.githubusercontent.com/34013325/57034414-d08cf800-6c25-11e9-9867-03024a30028a.gif)

> Ps. No vídeo o Filipe orienta a criar um novo projeto para adicionar a api do Youtube, porem aqui, estou usando o mesmo projeto que criei para o video-maker, mas caso queria criar um novo projeto basta seguir os passos de **Criando o Projeto** que está no começo desse guia!

Agora clique na guia **Tela de consentimento OAuth** 
![image](https://user-images.githubusercontent.com/34013325/57034753-c0294d00-6c26-11e9-8ee9-ff5e12ea6470.png)

Em seguida preencha apenas o campo "nome do aplicativo", futuramente você pode voltar aqui para personalizar com as outras informações caso desejar:

![image](https://user-images.githubusercontent.com/34013325/57034907-1d250300-6c27-11e9-8c9f-e2e0d4e95b95.png)

Clique no dropdown **Criar credenciais** e escolha **ID do Cliente OAuth**:
![image](https://user-images.githubusercontent.com/34013325/57035299-1054df00-6c28-11e9-9a04-a4cef439e41e.png)

Aqui não tem muito segredo, escolha **Aplicativo da Web** para o **Tipo de Aplicativo**, escolha um **nome do aplicativo**, no primeiro campo insira o endereço **http://localhost:5000** e no segundo **http://localhost:5000/oauth2callback** e clique no botão criar:

![image](https://user-images.githubusercontent.com/34013325/57035477-85281900-6c28-11e9-829a-1c0c074bc478.png)

Após ser criada, irá aparecer uma janela com as credenciais, você pode dar ok, pois iremos baixar as credencias como na tela abaixo:

![image](https://user-images.githubusercontent.com/34013325/57036076-aa695700-6c29-11e9-8c4d-fc78fecdae46.png)

renomeio o arquivo para **google-youtube.json** e salve dentro da pasta **video-maker/credentials** 😄

## 1.., 2..., 3... Testando! ##
Agora dentro da pasta **video-maker** você pode abrir o **cmd** ou **powershell** e executar o comando:
```
node index.js
```
![ezgif-5-a906cfcd3fd1](https://user-images.githubusercontent.com/34013325/57246263-33f69b80-7013-11e9-97a1-2f84acf2a7fe.gif)