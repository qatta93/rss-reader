import { useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Article, Feed } from "@/constants/types";
import { v4 as uuidv4 } from "uuid";

type FilterType = "all" | "read" | "unread";

export const useFeedsManager = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articlesByFeed, setArticlesByFeed] = useState<
    Record<string, Article[]>
  >({});
  const [readArticles, setReadArticles] = useState<Record<string, string[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [favorites, setFavorites] = useState<Record<string, string[]>>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);

  const defaultFeeds: Feed[] = [
    {
      id: "nasa",
      name: "NASA Breaking News",
      url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      createdAt: new Date().toISOString(),
    },
  ];

  const fetchFeedsAndArticles = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem("feeds");
      const localFeeds: Feed[] = stored ? JSON.parse(stored) : [];

      let updatedLocalFeeds = [...localFeeds];
      defaultFeeds.forEach((defaultFeed) => {
        const existingFeedIndex = updatedLocalFeeds.findIndex(
          (f) => f.id === defaultFeed.id
        );
        if (existingFeedIndex === -1) {
          updatedLocalFeeds.push(defaultFeed);
        }
      });

      await AsyncStorage.setItem("feeds", JSON.stringify(updatedLocalFeeds));

      const uniqueFeeds = updatedLocalFeeds.filter(
        (feed, index, self) => index === self.findIndex((f) => f.id === feed.id)
      );
      setFeeds(uniqueFeeds);

      const storedRead = await AsyncStorage.getItem("readArticles");
      const readData = storedRead ? JSON.parse(storedRead) : {};
      setReadArticles(readData);

      const articlesByFeedTemp: Record<string, Article[]> = {};

      await Promise.all(
        uniqueFeeds.map(async (feed) => {
          try {
            const res = await axios.get(
              "https://api.rss2json.com/v1/api.json",
              {
                params: { rss_url: feed.url },
              }
            );

            articlesByFeedTemp[feed.id] = res.data.items.map((item: any) => ({
              title: item.title || "",
              pubDate: item.pubDate,
              link: item.link,
              content: item.content || item.description,
              guid: item.guid,
              feedId: feed.id,
              read: readData[feed.id]?.includes(item.guid) ?? false,
            }));
          } catch (error) {
            console.error(`Błąd pobierania artykułów z ${feed.name}:`, error);
            articlesByFeedTemp[feed.id] = [];
          }
        })
      );

      setArticlesByFeed(articlesByFeedTemp);

      const storedFavorites = await AsyncStorage.getItem("favorites");
      const favoritesData = storedFavorites ? JSON.parse(storedFavorites) : {};
      setFavorites(favoritesData);
    } catch (e) {
      console.error("Błąd ładowania feedów:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFeed = async (updatedFeed: Feed) => {
    const updatedFeeds = feeds.map((f) =>
      f.id === updatedFeed.id ? updatedFeed : f
    );

    await AsyncStorage.setItem("feeds", JSON.stringify(updatedFeeds));
    setFeeds(updatedFeeds);
    fetchFeedsAndArticles();
  };

  const toggleReadStatus = async (feedId: string, articleId: string) => {
    setReadArticles((prev) => {
      const alreadyRead = prev[feedId] || [];
      const updated = [...new Set([...alreadyRead, articleId])];
      const newState = { ...prev, [feedId]: updated };

      AsyncStorage.setItem("readArticles", JSON.stringify(newState));
      return newState;
    });

    setArticlesByFeed((prev) => {
      const updatedArticles = prev[feedId]?.map((article) =>
        article.guid === articleId ? { ...article, read: true } : article
      );
      return { ...prev, [feedId]: updatedArticles };
    });
  };

  const toggleFavorite = async (feedId: string, articleId: string) => {
    setFavorites((prev) => {
      const alreadyFavorite = prev[feedId] || [];
      const updated = alreadyFavorite.includes(articleId)
        ? alreadyFavorite.filter((id) => id !== articleId)
        : [...alreadyFavorite, articleId];
      const newState = { ...prev, [feedId]: updated };

      AsyncStorage.setItem("favorites", JSON.stringify(newState));
      return newState;
    });
  };

  const handleDeleteFeed = async (feedId: string) => {
    const updatedFeeds = feeds.filter((f) => f.id !== feedId);
    await AsyncStorage.setItem("feeds", JSON.stringify(updatedFeeds));
    setFeeds(updatedFeeds);

    const updatedArticles = { ...articlesByFeed };
    delete updatedArticles[feedId];
    setArticlesByFeed(updatedArticles);

    const updatedRead = { ...readArticles };
    delete updatedRead[feedId];
    await AsyncStorage.setItem("readArticles", JSON.stringify(updatedRead));
    setReadArticles(updatedRead);

    const updatedFav = { ...favorites };
    delete updatedFav[feedId];
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFav));
    setFavorites(updatedFav);
  };

    const saveFeedsToStorage = async (updatedFeeds: Feed[]) => {
      try {
        await AsyncStorage.setItem(
          "feeds",
          JSON.stringify(updatedFeeds)
        );
        setFeeds(updatedFeeds);
      } catch (error) {
        console.error("Error saving feeds:", error);
      }
    };

   const addFeed = async (name: string, url: string) => {
     const newFeed: Feed = {
       id: uuidv4(),
       name,
       url,
       createdAt: new Date().toISOString(),
     };

     const updatedFeeds = [...feeds, newFeed];
     await saveFeedsToStorage(updatedFeeds);
     return true;
   };

  const getFilteredArticles = () => {
    const filteredArticles: Record<string, Article[]> = {};
    Object.entries(articlesByFeed).forEach(([feedId, articles]) => {
      filteredArticles[feedId] =
        filter === "all"
          ? articles
          : filter === "read"
          ? articles.filter((a) => a.read)
          : articles.filter((a) => !a.read);
    });
    return filteredArticles;
  };

  const searchFilteredArticles = (articles: Article[]) => {
    if (!searchQuery) return articles;
    return articles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const openEditModal = (feed: Feed) => {
    setSelectedFeed(feed);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  return {
    feeds,
    loading,
    filter,
    searchQuery,
    editModalVisible,
    selectedFeed,
    favorites,
    fetchFeedsAndArticles,
    setFilter,
    setSearchQuery,
    handleSaveFeed,
    toggleReadStatus,
    toggleFavorite,
    handleDeleteFeed,
    getFilteredArticles,
    searchFilteredArticles,
    openEditModal,
    closeEditModal,
    addFeed,
  };
};
