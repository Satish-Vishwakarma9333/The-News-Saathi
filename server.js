const express = require("express");
const Parser = require("rss-parser");

const app = express();
const PORT = 3000;

const parser = new Parser({
    timeout: 15000,

    headers: {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36"
    }
});


/* =========================================
   NEWS SOURCES
========================================= */

const sources = [

    {
        id: "ndtv",
        name: "NDTV",
        short: "ND",
        feed:
            "https://feeds.feedburner.com/ndtvnews-top-stories",
        site:
            "https://www.ndtv.com/"
    },

    {
        id: "india-today",
        name: "India Today",
        short: "IT",
        feed:
            "https://www.indiatoday.in/rss/home",
        site:
            "https://www.indiatoday.in/"
    },

    {
        id: "hindustan-times",
        name: "Hindustan Times",
        short: "HT",
        feed:
            "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml",
        site:
            "https://www.hindustantimes.com/"
    },

    {
        id: "the-hindu",
        name: "The Hindu",
        short: "TH",
        feed:
            "https://www.thehindu.com/feeder/default.rss",
        site:
            "https://www.thehindu.com/"
    },

    {
        id: "bbc-news",
        name: "BBC News",
        short: "BBC",
        feed:
            "https://feeds.bbci.co.uk/news/rss.xml",
        site:
            "https://www.bbc.com/news"
    }

];


/* =========================================
   CLEAN TEXT
========================================= */

function cleanText(text = "") {

    return String(text)

        .replace(
            /<script[\s\S]*?<\/script>/gi,
            " "
        )

        .replace(
            /<style[\s\S]*?<\/style>/gi,
            " "
        )

        .replace(
            /<[^>]*>/g,
            " "
        )

        .replace(
            /&nbsp;/gi,
            " "
        )

        .replace(
            /&amp;/gi,
            "&"
        )

        .replace(
            /&quot;/gi,
            '"'
        )

        .replace(
            /&#39;/gi,
            "'"
        )

        .replace(
            /&apos;/gi,
            "'"
        )

        .replace(
            /&lt;/gi,
            "<"
        )

        .replace(
            /&gt;/gi,
            ">"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();
}


/* =========================================
   GET RSS SUMMARY
========================================= */

function getRSSSummary(item) {

    return cleanText(

        item.contentSnippet ||

        item.content ||

        item.summary ||

        item.description ||

        ""

    );
}


/* =========================================
   FETCH ORIGINAL ARTICLE
========================================= */

async function fetchArticleText(url) {

    if (!url) {
        return "";
    }


    try {

        const response =
            await fetch(
                url,
                {

                    method: "GET",

                    headers: {

                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36",

                        "Accept":
                            "text/html,application/xhtml+xml"

                    },

                    signal:
                        AbortSignal.timeout(12000)

                }
            );


        if (!response.ok) {

            console.log(
                `Article HTTP ${response.status}: ${url}`
            );

            return "";

        }


        const html =
            await response.text();


        let articleHTML =
            html;


        /*
         * Remove unwanted HTML
         */

        articleHTML =
            articleHTML

                .replace(
                    /<script[\s\S]*?<\/script>/gi,
                    " "
                )

                .replace(
                    /<style[\s\S]*?<\/style>/gi,
                    " "
                )

                .replace(
                    /<nav[\s\S]*?<\/nav>/gi,
                    " "
                )

                .replace(
                    /<footer[\s\S]*?<\/footer>/gi,
                    " "
                );


        /*
         * Try article tag
         */

        const articleMatch =
            articleHTML.match(
                /<article\b[^>]*>([\s\S]*?)<\/article>/i
            );


        if (articleMatch) {

            articleHTML =
                articleMatch[1];

        }


        const text =
            cleanText(articleHTML);


        if (text.length < 300) {

            return "";

        }


        return text;


    } catch (error) {

        console.log(
            "Article extraction failed:",
            error.message
        );

        return "";

    }
}


/* =========================================
   SPLIT SENTENCES
========================================= */

function splitSentences(text) {

    return (

        text.match(
            /[^.!?]+[.!?]+/g
        ) || [text]

    );

}


/* =========================================
   CREATE ~300 WORD SUMMARY
========================================= */

function createSummary(
    title,
    articleText,
    rssText
) {

    let sourceText =
        cleanText(
            articleText ||
            rssText ||
            ""
        );


    if (!sourceText) {

        return (
            "A detailed summary is currently " +
            "unavailable from this publisher. " +
            "Please use the Read on button to " +
            "open the original article."
        );

    }


    /*
     * Remove duplicate title
     */

    if (
        title &&
        sourceText
            .toLowerCase()
            .startsWith(
                title
                    .toLowerCase()
            )
    ) {

        sourceText =
            sourceText
                .substring(
                    title.length
                )
                .trim();

    }


    const sentences =
        splitSentences(
            sourceText
        );


    const TARGET_WORDS = 300;

    let summary = "";

    let wordCount = 0;


    for (
        const sentence
        of sentences
    ) {

        const cleaned =
            sentence.trim();


        if (!cleaned) {
            continue;
        }


        const words =
            cleaned.split(/\s+/);


        if (
            wordCount +
            words.length >
            TARGET_WORDS
        ) {

            break;

        }


        summary +=
            (
                summary
                    ? " "
                    : ""
            ) +
            cleaned;


        wordCount +=
            words.length;


        if (
            wordCount >=
            TARGET_WORDS
        ) {

            break;

        }

    }


    /*
     * If sentence extraction gives
     * very little text, use word slice.
     */

    if (
        wordCount < 180 &&
        sourceText.split(/\s+/).length >= 180
    ) {

        summary =
            sourceText
                .split(/\s+/)
                .slice(
                    0,
                    TARGET_WORDS
                )
                .join(" ") +
            "...";

    }


    return (
        summary ||
        "Read the original article for " +
        "complete details."
    );

}


/* =========================================
   FETCH SOURCE
========================================= */

async function fetchSource(source) {

    try {

        console.log(
            `Fetching ${source.name}...`
        );


        /*
         * Cache-busting query parameter
         */

        const feedURL =
            `${source.feed}${source.feed.includes("?") ? "&" : "?"}_=${Date.now()}`;


        const feed =
            await parser.parseURL(
                feedURL
            );


        const items =
            (feed.items || [])

                .filter(
                    item =>
                        item.title &&
                        item.link
                )

                .slice(
                    0,
                    6
                );


        /*
         * If feed has no articles
         */

        if (
            items.length === 0
        ) {

            console.log(
                `${source.name}: No articles`
            );


            return {

                ...source,

                news: [],

                error:
                    "No headlines available"

            };

        }


        const news =
            await Promise.all(

                items.map(
                    async (
                        item,
                        index
                    ) => {

                        const rssSummary =
                            getRSSSummary(
                                item
                            );


                        /*
                         * Try original article
                         */

                        const articleText =
                            await fetchArticleText(
                                item.link
                            );


                        const summary =
                            createSummary(
                                item.title,
                                articleText,
                                rssSummary
                            );


                        return {

                            id:
                                `${source.id}-${index}-${Date.now()}`,

                            title:
                                cleanText(
                                    item.title
                                ),

                            summary:

                                summary,

                            link:
                                item.link,

                            pubDate:

                                item.isoDate ||

                                item.pubDate ||

                                new Date()
                                    .toISOString(),

                            source:
                                source.name

                        };

                    }
                )

            );


        console.log(
            `${source.name}: ${news.length} headlines`
        );


        return {

            ...source,

            news,

            error: null

        };


    } catch (error) {

        console.log(
            `${source.name} failed:`
        );

        console.log(
            error.message
        );


        return {

            ...source,

            news: [],

            error:
                "This source is temporarily unavailable"

        };

    }

}


/* =========================================
   NEWS API
========================================= */

app.get(
    "/api/news",
    async (req, res) => {

        const requestTime =
            new Date();


        console.log("");
        console.log(
            "================================"
        );

        console.log(
            "FRESH NEWS REQUEST"
        );

        console.log(
            requestTime.toLocaleTimeString()
        );

        console.log(
            "================================"
        );


        try {

            /*
             * Fetch ALL sources again.
             * No server-side news cache.
             */

            const columns =
                await Promise.all(
                    sources.map(
                        source =>
                            fetchSource(
                                source
                            )
                    )
                );


            /*
             * Disable browser/proxy caching
             */

            res.set({

                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",

                "Pragma":
                    "no-cache",

                "Expires":
                    "0",

                "Surrogate-Control":
                    "no-store"

            });


            res.json({

                updatedAt:
                    requestTime.toISOString(),

                columns

            });


        } catch (error) {

            console.error(
                "NEWS API ERROR:",
                error
            );


            res.status(
                500
            ).json({

                error:
                    "Unable to fetch news"

            });

        }

    }
);


/* =========================================
   SERVE FRONTEND
========================================= */

app.use(
    express.static(
        __dirname,
        {
            etag: false,
            lastModified: false,
            maxAge: 0
        }
    )
);


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "==============================="
        );

        console.log(
            "       THE NEWS SAATHI"
        );

        console.log(
            "==============================="
        );

        console.log(
            `Server running at http://localhost:${PORT}`
        );

        console.log(
            "==============================="
        );

    }
);