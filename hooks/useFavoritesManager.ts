import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Article, Feed } from "@/constants/types";

export const useFavoritesManager = () => {
  const [favoriteArticles, setFavoriteArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const feedsFromStorage = await AsyncStorage.getItem("feeds");
      const localFeeds: Feed[] = feedsFromStorage
        ? JSON.parse(feedsFromStorage)
        : [];

      const storedFavorites = await AsyncStorage.getItem("favorites");
      const favoriteGuids: Record<string, string[]> = storedFavorites
        ? JSON.parse(storedFavorites)
        : {};

      const matchedArticles: Article[] = [];

      await Promise.all(
        localFeeds.map(async (feed) => {
          try {
            const res = await axios.get(
              "https://api.rss2json.com/v1/api.json",
              {
                params: { rss_url: feed.url },
              }
            );

            const items: Article[] = res.data.items.map((item: any) => ({
              title: item.title || "",
              pubDate: item.pubDate,
              link: item.link,
              content: item.content || item.description,
              guid: item.guid,
              feedId: feed.id,
              read: false,
            }));

            const guids = favoriteGuids[feed.id] || [];

            const favoritesFromThisFeed = items.filter((a) =>
              guids.includes(a.guid)
            );

            matchedArticles.push(...favoritesFromThisFeed);
          } catch (error) {
            console.error(`Błąd ładowania feedu ${feed.name}:`, error);
          }
        })
      );

      matchedArticles.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );

      setFavoriteArticles(matchedArticles);
    } catch (error) {
      console.error("Błąd ładowania ulubionych:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromFavorites = async (feedId: string, articleGuid: string) => {
    try {
      const stored = await AsyncStorage.getItem("favorites");
      const favorites = stored ? JSON.parse(stored) : {};

      const updated = {
        ...favorites,
        [feedId]: (favorites[feedId] || []).filter(
          (guid: string) => guid !== articleGuid
        ),
      };

      await AsyncStorage.setItem("favorites", JSON.stringify(updated));

      setFavoriteArticles((prev) =>
        prev.filter((a) => !(a.guid === articleGuid && a.feedId === feedId))
      );
    } catch (e) {
      console.error("Błąd usuwania z ulubionych:", e);
    }
  };

  return {
    favoriteArticles,
    loading,
    fetchFavorites,
    removeFromFavorites,
  };
};
