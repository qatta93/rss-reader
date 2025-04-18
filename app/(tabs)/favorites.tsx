import React, { useState, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Card, Title, Paragraph, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Article, Feed } from "@/constants/types";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function Favorites() {
  const [favoriteArticles, setFavoriteArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const router = useRouter();

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

      setFavoriteArticles(matchedArticles);
    } catch (error) {
      console.error("Błąd ładowania ulubionych:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

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

  if (loading) return <ActivityIndicator animating />;

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          paddingTop: isMobile ? 0 : 70,
          marginBottom: 32,
          maxWidth: 1200,
          marginHorizontal: "auto",
          width: "100%",
        }}>
        <Text style={styles.title}>Twoje ulubione artykuły</Text>
        {favoriteArticles.length === 0 ? (
          <Text style={styles.noFavoritesText}>Brak ulubionych artykułów.</Text>
        ) : (
          favoriteArticles.map((article) => (
            <Pressable
              key={article.guid}
              onPress={() => {
                router.push({
                  pathname: "../article",
                  params: {
                    title: article.title,
                    pubDate: article.pubDate,
                    content: article.content,
                    link: article.link,
                  },
                });
              }}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardContent}>
                    <View style={styles.cardText}>
                      <Title>{article.title}</Title>
                      <Paragraph>
                        {new Date(article.pubDate).toLocaleString()}
                      </Paragraph>
                    </View>
                    <IconButton
                      icon="heart"
                      onPress={() =>
                        removeFromFavorites(article.feedId!, article.guid)
                      }
                    />
                  </View>
                </Card.Content>
              </Card>
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 16,
    textAlign: "center",
  },
  noFavoritesText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 4,
    backgroundColor: "#fff",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardText: {
    flex: 1,
    paddingRight: 8,
  },
});
