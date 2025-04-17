import { useCallback, useEffect, useState } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Article, Feed } from "@/constants/types";
import EditFeedModal from "@/components/EditFeedModal";

type FilterType = "all" | "read" | "unread";

export default function Home() {
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

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<Feed | null>(null);

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
      const uniqueFeeds = allFeeds.filter(
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
    } catch (e) {
      console.error("Błąd ładowania feedów:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFeedsAndArticles();
    }, [])
  );

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

  const filteredArticles: Record<string, Article[]> = {};
  Object.entries(articlesByFeed).forEach(([feedId, articles]) => {
    filteredArticles[feedId] =
      filter === "all"
        ? articles
        : filter === "read"
        ? articles.filter((a) => a.read)
        : articles.filter((a) => !a.read);
  });

  const searchFilteredArticles = (articles: Article[]) => {
    if (!searchQuery) return articles;
    return articles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSaveFeed = async (updatedFeed: Feed) => {
    const updatedFeeds = feeds.map((f) =>
      f.id === updatedFeed.id ? updatedFeed : f
    );
    const customFeeds = updatedFeeds.filter(
      (f) => !defaultFeeds.find((df) => df.id === f.id)
    );

    await AsyncStorage.setItem("feeds", JSON.stringify(customFeeds));
    setFeeds(updatedFeeds);
    fetchFeedsAndArticles();
  };

  if (loading) return <ActivityIndicator animating={true} />;

  return (
    <>
      <ScrollView style={{ padding: 10 }}>
        <View style={styles.filterRow}>
          {["all", "unread", "read"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFilter(type as FilterType)}
              style={[
                styles.filterButton,
                filter === type && styles.activeFilterButton,
              ]}>
              <Text
                style={[
                  styles.filterButtonText,
                  filter === type && styles.activeFilterButtonText,
                ]}>
                {type === "all"
                  ? "Wszystkie"
                  : type === "unread"
                  ? "Nieprzeczytane"
                  : "Przeczytane"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Wyszukaj po tytule..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {feeds.map((feed) => (
          <View key={feed.id} style={styles.feedSection}>
            <View style={styles.feedTitleRow}>
              <Text style={styles.feedTitle}>{feed.name}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setSelectedFeed(feed);
                  setEditModalVisible(true);
                }}>
                <IconButton icon="pencil" size={20} />
                <Text style={styles.editText}>Edytuj feed</Text>
              </TouchableOpacity>
            </View>

            {searchFilteredArticles(filteredArticles[feed.id] || []).map(
              (item) => (
                <Pressable
                  key={item.guid}
                  onPress={() => {
                    toggleReadStatus(feed.id, item.guid);
                    router.push({
                      pathname: "../article",
                      params: {
                        title: item.title,
                        pubDate: item.pubDate,
                        content: item.content,
                        link: item.link,
                      },
                    });
                  }}>
                  <Card
                    style={[
                      styles.card,
                      item.read ? styles.readCard : styles.unreadCard,
                    ]}>
                    <Card.Content>
                      <Title>{item.title}</Title>
                      <Paragraph>
                        {new Date(item.pubDate).toLocaleString()}
                      </Paragraph>
                    </Card.Content>
                  </Card>
                </Pressable>
              )
            )}
          </View>
        ))}
      </ScrollView>

      <EditFeedModal
        visible={editModalVisible}
        feed={selectedFeed}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveFeed}
      />
    </>
  );
}

const styles = StyleSheet.create({
  feedSection: {
    marginBottom: 24,
  },
  feedTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 4,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 4,
  },
  readCard: {
    backgroundColor: "rgb(249, 249, 249)",
  },
  unreadCard: {
    backgroundColor: "rgb(255, 250, 255)",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: "#7c3aed",
  },
  filterButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  editText: {
    fontSize: 12,
    color: "#555",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 10,
    fontSize: 16,
    width: 300,
    alignSelf: "center",
  },
});
