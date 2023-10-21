# Persian Web Scraper

A scrapper to scrape popular persian websites. This is intended to be used as a tool to create corpora for Persian language. The scrapper supports Socks5 in order to rotate requests between multiple IPs 


## Motivation
GPT3 as the first successful large language model has made it evident that training very large language models on extensively large text corpora results in useful models that perform various NLP tasks without any actual training. One of the two main reasons for this to become possible is the structure of the training data i.e. an extensively large text corpora. As pointed out in the GPT3 paper, large text corpora contains different contexts each with suitably large number of examples that enable the models to do -- what they call -- "in-context learning". 

Currently, most of the popular large Persian corpora are in raw text format without any meta-data so it is difficult to select parts of them for different NLP tasks and more importantly to build up a large text corpora containing properly sized sub-contexts to enable training large language models with zero-shot and few-shot learning capabilities. PersianWebScrapper has been developed to address this issue. This scrapper keeps the meta-data associated with texts and also preserves the structure of the original text to enable gathering large corpora of text that contain sub-contexts with sufficiently large tails. In each article these meta-data are provided along with text in a JSON object:

 - publish date
 - title
 - surtitle, subtitle/lead, summary (if provided)
 - content with meta-information such as type(paragraph, heading, blockquote, etc.) and link references
 - comments with author, date, content (if available)
 - keywords (if provided)
 - catgory (if any)

## Usage
PersianWebScrapper can be used both local and in container

### Local
nodejs v18 or above is required to run the scraper. The following command runs the scraper:

```
yarn dev && yarn start [SUPPORTED_DOMAIN] [options]
```

Options are: 
   - --configFile, -c FILE_PATH:  
       A json config file as described [here](#config-file)  [optional] [default:"./.config"]
   - --verbosity, -v LEVEL        
       set verbosity level from 0 to 10 [optional] [default: 4 = progress]
   - --delay, -d SECONDS          
       Delay between requests to same address in seconds [optional] [default: 1 second]
   - --max-concurent, -m COUNT    
       max concurrent requests [optional] [default: 1 = single]
   - --proxies, -p RANGE          
       proxy ports to be used can be a single Socks5 port or range (ex.32001-32005)[optional] [default: not set]
   - --hostIP IP                  
       proxy host IP to be used mostly used on docker based version [optional] [default: not set]
   - --url, -u URL                
       URL to be retrieved just to check if data retrieval works fine [optional]
   - --logPath, -l                
       Path to store error logs [optional] [default: ./log]
   - --runQuery QUERY_STRING
       SQLQuery to run on domain-specific SQLiteDB [optional]

### Container
To create the docker images use the following shell script:

```
    ./buildDockerImages.sh $REGISTRY
```
and to use it create a container and run it using the following command:

```
    docker run -d \
           --name CONTAINER_NAME \
           -v$DB_PATH/:/db \
           -v$CORPORA_PATH:/corpora \
           -v$LOG_PATH:/log \
           --mount type=bind,source=$PATH2CONFIG/config.json,target=/etc/config.json \
           $REGISTRY/webscrap/scrapper:latest \
           node .build/index.js CONTAINER_NAME -c /etc/config.json \
           $OPTION_1 $OPTION_2 $OPTION_3 $OPTION_4 ... $OPTION_n
```

you can also use scripts provided in the scripts folder to run the scraper on multiple domains

## Config file 
Config file is optional but helps to provide all your scrappers with same base configuration options. It is a JSON file with following fields which again, are all optional:

```
{
    debugVerbosity: 4,
    debugDB: false,
    showInfo: true,
    showWarnings: true,
    maxConcurrent: 1,
    db: "./db",
    corpora: "./corpora",
    proxies: 3302-3306,
    hostIP: 172.17.0.1,
    logPath: "./log",
    compact: false
}
```

## Output structure
PersianWebScrapper scrapes whole contents of the target site in order to find all internal links but will store just articles which has at least a Title. Also it will store whole URLs and their scrapping status in a local SQLite DB. JSON schema for the articles is as follows 

```
{
    url: string,                //Article normalized URL
    category?: string,          //Category as specified by the article
    date: string,               //Article publish date (if specified)
    title: string,              //Title of the article
    aboveTitle?: string,        //Surtitle or any text provided before Title
    subtitle?: string,          //Subtitle or Lead (if provided)
    summary?: string,           //Summary (if provided)
    content?: IntfText[],       //An array containing main article each item structure will be 
                                //{ text: string, type: enuTextType, ref?: string } 
                                //where ref is just for items provided with a hyperlink
    comments?: IntfComment[]    //An array of comments (if any) in the following structure: 
                                //{ text: string, author?: string, date?: string }
    images?: IntfImage[],       //List of image URLs used in the article with their alt-texts.
                                //{ src: string, alt?: string }
    tags?: string[],            //List of tags provided with the article
}
```

## Contribution
Configuring scrapper to scrap new WebSites is also easy.

1. First check if the sites is based on one of the popular CMS portals such as: 
    - [Asam](https://aasaam.com/product/cms)
    - [IranDrupal](https://irandrupal.com/)
    - [IranSamaneh](https://iransamaneh.com/)
    - [Nastooh](https://www.nastooh.ir/)
    - [StudioKhabar](http://www.news-studio.com/)

2. Add new item to ```enuDomains``` in ```interface.ts```
3. Create an instance of clsScrapper or one of the predefined portal classes
4. Configure or overwrite preconfigured properties as follows: 
```
{
    selectors?: {
        //A css selector or a function to select HTML element containing main article
        article?: string | IntfSelectorFunction, 

        //A css selector or a function to select HTML element in the article containing surtitle
        aboveTitle?: string | IntfSelectorFunction,

        //A css selector or a function to select HTML element in the article containing title
        title?: string | IntfSelectorFunction,

        //A css selector or a function to select HTML element in the article containing subtitle
        subtitle?: string | IntfSelectorFunction,

        //A css selector or a function to select HTML element in the article containing summary
        summary?: string | IntfSelectorFunction,

        content?: {
            //A css selector or a function to select HTML element in the article containing main content
            main?: string | IntfSelectAllFunction,
            
            //A css selector or a function to select HTML element in the article containing main content if main selector fails
            alternative?: string | IntfSelectAllFunction,

            //A css selector or a function to select HTML element in the article containing text content used on old-fashion sites
            textNode?: string | IntfSelectorFunction,


            //list of strings or regularexpression which will be checked against each paragrpah and discard them if matched 
            ignoreTexts?: string[] | RegExp[],

            //list of classNames or a function to check if the node must be proceessed as a text node or discarded 
            ignoreNodeClasses?: string[] | IntfIsValidFunction,
        },
        //Comments can be selected using following configuration or by providing a method for AJAX loaded comments (ex. farsnews)
        comments?: {
            //A css selector or a function to select HTML elements representing a comment box
            container?: string | IntfSelectAllFunction,

            //A css selector or a function to capture date of the comment
            datetime?: string | IntfDateSplitter,

            //A css selector or a function to capture author of the comment
            author?: string | IntfSelectorFunction,

            //A css selector or a function to capture text of the comment
            text?: string | IntfSelectorFunction
        },
        //A css selector or a function to select HTML elements representing tags
        tags?: string | IntfSelectAllFunction,
        datetime?: {
            //A css selector or a function to select HTML element representing publication date
            conatiner?: string | IntfSelectorFunction,
            //An string to split date from hour or a function for complex date detectors (check samples in special virgool)
            splitter?: string | IntfDateSplitter
        }
        category?: {
            //A css selector or a function to select HTML elements representing category or breadcrumb items
            selector?: string | IntfSelectAllFunction,
            //Some sites use Home as first breadcrumb item so you can skip these item 
            startIndex?: number,
        }
    },
    url?: {
        //Some sites are hosted on multiple TLDs you can provide list of similar domains here
        extraValidDomains?: string[]
        //Some paths must not be check (such as ads,print,file,redirect etc.) most of them are defined in clsScrapper.ts as invalidStartPaths define domain specific items here
        extraInvalidStartPaths?: string[],

        //Wheter in the URL normalization process keep 'www.' or remove it
        removeWWW?: boolean,

        //Most of the sites have extra text in the URL which has no effect (ex /news/123/NO_EFFECT_TEXT). Set paths which must be normalized removing extra text
        validPathsItemsToNormalize?: string[]
        //Some site paths start with extra string mostly used for language (ex. /fa/news/123/NO_EFFECT_TEXT) indicate which part of the path must be checked
        pathToCheckIndex?: number | null
    },
    //An optional function to preprocess HTML and remove extra parts or any other preprocessing
    preHTMLParse?: (html: string) => string
}
``` 

You can also override the following methods:  

- Initialization method mostly used for sites behind CDN which need warmup
```
    async init(): Promise<boolean> { return true }
```    

- A method to capture and ignore complex text nodes in content (ex. check khabaronline)
```
textNodeMustBeIgnored(textEl: HTMLElement, index: number, allElements: HTMLElement[])
```    

- A method to add extra headers to each request 
```
extraHeaders()
```    

- A method to create initial cookies for each proxy (ex. check alef.ir)
```
async initialCookie(proxy?: IntfProxy, url?: string): Promise<string | undefined>
```    

- A method to nomalize a path by removing extra items or discard the path. There are many examples in the code
```
protected normalizePath(url: URL, conf?: IntfURLNormaliziztionConf): string 
```

## Corpus
We have used this scrapper to scrap some popular Persian websites and created a large Persian corpus which will be soon published on Huggingface

