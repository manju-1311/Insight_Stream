import axios from 'axios';
import React, { useEffect, useState } from 'react'

const API_KEY = '37306aca596542f0a8402978de3d4224';
const API_URL = 'https://newsapi.org/v2/everything';
const requestConfig = { timeout: 7000 };

let newsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;



export const GeneralContext = React.createContext();

const GeneralContextProvider = ({children}) => {

    const [topNews, setTopNews] = useState([])

    const [businessNews, setBusinessNews] = useState([]);
    const [technologyNews, setTechnologyNews] = useState([]);
    const [politicsNews, setPoliticsNews] = useState([]);

    useEffect(() => {
      let active = true;

      const loadNews = async () => {
        if (newsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
          setTopNews(newsCache.topNews);
          setBusinessNews(newsCache.businessNews);
          setPoliticsNews(newsCache.politicsNews);
          setTechnologyNews(newsCache.technologyNews);
          return;
        }

        const queries = ['popular', 'business', 'politics', 'technology'];
        try {
          const responses = await Promise.allSettled(
            queries.map((query) => axios.get(API_URL, {
              ...requestConfig,
              params: { q: query, pageSize: 20, sortBy: 'publishedAt', language: 'en', apiKey: API_KEY },
            }))
          );
          if (!active) return;
          const articles = responses.map((result) => result.status === 'fulfilled' ? result.value.data.articles || [] : []);
          const [top, business, politics, technology] = articles;
          const nextNews = { topNews: top, businessNews: business, politicsNews: politics, technologyNews: technology };
          newsCache = nextNews;
          cacheTimestamp = Date.now();
          setTopNews(top);
          setBusinessNews(business);
          setPoliticsNews(politics);
          setTechnologyNews(technology);
        } catch (error) {
          if (active) console.error('[v0] News fetch failed:', error.message);
        }
      };

      loadNews();
      return () => { active = false; };
    }, []);


    
  return (
    <GeneralContext.Provider value={{topNews, businessNews, technologyNews, politicsNews}} >{children}</GeneralContext.Provider>
  )
}

export default GeneralContextProvider
