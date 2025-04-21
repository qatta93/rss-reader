import { useCallback, useState } from "react";
import {
  ScrollView,
  Pressable,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { Card, Title, Paragraph, IconButton } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Article, Feed } from "@/constants/types";
import EditFeedModal from "@/components/EditFeedModal";
import { Colors } from "@/constants/Colors";

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

  const [favorites, setFavorites] = useState<Record<string, string[]>>({});

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const defaultFeeds: Feed[] = [
    {
      id: "nasa",
      name: "NASA Breaking News",
      url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
      createdAt: new Date().toISOString(),
    },
  ];

  const handleSaveFeed = async (updatedFeed: Feed) => {
    const updatedFeeds = feeds.map((f) =>
      f.id === updatedFeed.id ? updatedFeed : f
    );

    await AsyncStorage.setItem("feeds", JSON.stringify(updatedFeeds));
    setFeeds(updatedFeeds);
    fetchFeedsAndArticles();
  };

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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

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
                        from: "home",
                      },
                    });
                  }}>
                  <Card
                    style={[
                      styles.card,
                      item.read
                        ? { backgroundColor: Colors.cardReadBackground }
                        : { backgroundColor: Colors.cardUnreadBackground },
                    ]}>
                    <Card.Content
                      style={[
                        styles.cardContent,
                        isMobile && styles.cardContentMobile,
                      ]}>
                      <View style={{ flex: 1 }}>
                        <Title style={styles.cardTitle}>{item.title}</Title>
                        <Paragraph>
                          {new Date(item.pubDate).toLocaleString()}
                        </Paragraph>
                      </View>
                      <View
                        style={[
                          styles.articleActions,
                          isMobile && styles.articleActionsMobile,
                        ]}>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(feed.id, item.guid)}>
                          <IconButton
                            icon={
                              favorites[feed.id]?.includes(item.guid)
                                ? "heart"
                                : "heart-outline"
                            }
                            size={20}
                          />
                        </TouchableOpacity>
                      </View>
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
        onDelete={handleDeleteFeed}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  loadingText: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.buttonActive,
  },
  feedSection: {
    marginBottom: 24,
    marginHorizontal: "auto",
    maxWidth: 1200,
    width: "100%",
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
    color: Colors.text,
  },
  card: {
    marginVertical: 6,
    marginHorizontal: 4,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  cardContentMobile: {
    flexDirection: "column",
    alignItems: "center",
  },
  cardTitle: {
    flexShrink: 1,
    flexWrap: "wrap",
    overflow: "hidden",
    color: Colors.text,
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
    backgroundColor: Colors.buttonInactive,
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: Colors.buttonActive,
  },
  filterButtonText: {
    color: Colors.buttonText,
    fontWeight: "600",
  },
  activeFilterButtonText: {
    color: Colors.buttonActiveText,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingRight: 8,
  },
  editText: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  searchInput: {
    height: 40,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingLeft: 10,
    fontSize: 16,
    width: 300,
    alignSelf: "center",
    color: Colors.text,
  },
  articleActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  articleActionsMobile: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
