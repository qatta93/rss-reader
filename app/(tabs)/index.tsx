import { useCallback, useEffect, useState } from "react";
import { ScrollView, Pressable, Text, View, StyleSheet } from "react-native";
import { Card, Title, Paragraph, ActivityIndicator } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type Feed = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

type Article = {
  title: string;
  pubDate: string;
  link: string;
  content: string;
  guid: string;
  feedId: string;
};

export default function Home() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articlesByFeed, setArticlesByFeed] = useState<
    Record<string, Article[]>
  >({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

      const allFeeds = [...defaultFeeds, ...localFeeds];
      setFeeds(allFeeds);

      const articlesByFeedTemp: Record<string, Article[]> = {};

      await Promise.all(
        allFeeds.map(async (feed) => {
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
            }));
          } catch (error) {
            console.error(`Błąd pobierania artykułów z ${feed.name}:`, error);
            articlesByFeedTemp[feed.id] = [];
          }
        })
      );

      setArticlesByFeed(articlesByFeedTemp);
    } catch (e) {
      console.error("Błąd ładowania feedów:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedsAndArticles();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFeedsAndArticles();
    }, [])
  );

  if (loading) return <ActivityIndicator animating={true} />;

  return (
    <ScrollView style={{ padding: 10 }}>
      {feeds.map((feed) => (
        <View key={feed.id} style={styles.feedSection}>
          <Text style={styles.feedTitle}>{feed.name}</Text>
          {articlesByFeed[feed.id]?.map((item) => (
            <Pressable
              key={item.guid}
              onPress={() =>
                router.push({
                  pathname: "../article",
                  params: {
                    title: item.title,
                    pubDate: item.pubDate,
                    content: item.content,
                    link: item.link,
                  },
                })
              }>
              <Card style={styles.card}>
                <Card.Content>
                  <Title>{item.title}</Title>
                  <Paragraph>
                    {new Date(item.pubDate).toLocaleString()}
                  </Paragraph>
                </Card.Content>
              </Card>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  feedSection: {
    marginBottom: 24,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 4,
  },
});
