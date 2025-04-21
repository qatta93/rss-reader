import { useCallback } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  useWindowDimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import EditFeedModal from "@/components/EditFeedModal";
import { useFeedsManager } from "@/hooks/useFeedsManager";
import { LoadingScreen } from "@/components/LoadingScreen";
import { FilterBar } from "@/components/FilterBar";
import { SearchInput } from "@/components/SearchInput";
import { FeedHeader } from "@/components/FeedHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { useScrollToTop } from "@/hooks/useScrollToTop"; // Custom hook for scroll to top
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

export default function Home() {
  const {
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
  } = useFeedsManager();

  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { scrollViewRef, scrollHandler, scrollToTop, scrollToTopStyle } =
    useScrollToTop();

  useFocusEffect(
    useCallback(() => {
      fetchFeedsAndArticles();
    }, [])
  );

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredArticles = getFilteredArticles();

  return (
    <>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />

        {feeds.map((feed) => {
          const articles = searchFilteredArticles(
            filteredArticles[feed.id] || []
          );
          if (!articles.length) return null;

          return (
            <View key={feed.id} style={styles.feedSection}>
              <FeedHeader
                title={feed.name}
                onEdit={() => openEditModal(feed)}
              />
              {articles.map((article) => (
                <ArticleCard
                  key={article.guid}
                  article={article}
                  variant="feed"
                  isMobile={isMobile}
                  isFavorite={
                    favorites[feed.id]?.includes(article.guid) || false
                  }
                  onPress={() => {
                    toggleReadStatus(feed.id, article.guid);
                    router.push({
                      pathname: "../article",
                      params: {
                        title: article.title,
                        pubDate: article.pubDate,
                        content: article.content,
                        link: article.link,
                        from: "home",
                      },
                    });
                  }}
                  onToggleFavorite={() => toggleFavorite(feed.id, article.guid)}
                />
              ))}
            </View>
          );
        })}
      </Animated.ScrollView>

      <Animated.View style={[styles.scrollToTop, scrollToTopStyle]}>
        <TouchableOpacity onPress={scrollToTop}>
          <Text style={styles.scrollToTopText}>↑</Text>
        </TouchableOpacity>
      </Animated.View>

      <EditFeedModal
        visible={editModalVisible}
        feed={selectedFeed}
        onClose={closeEditModal}
        onSave={handleSaveFeed}
        onDelete={handleDeleteFeed}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 10,
  },
  feedSection: {
    marginBottom: 24,
    marginHorizontal: "auto",
    maxWidth: 1200,
    width: "100%",
  },
  scrollToTop: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: Colors.black,
    padding: 12,
    borderRadius: 50,
    zIndex: 1000,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollToTopText: {
    color: Colors.background,
    fontSize: 20,
  },
  scrollToTopTooltip: {
    position: "absolute",
    top: -25,
    right: 0,
    color: Colors.background,
    fontSize: 12,
    textAlign: "center",
  },
});
