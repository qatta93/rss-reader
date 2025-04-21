import { useCallback } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  useWindowDimensions,
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
      <ScrollView style={styles.scrollView}>
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />

        {feeds.map((feed) => (
          <View key={feed.id} style={styles.feedSection}>
            <FeedHeader title={feed.name} onEdit={() => openEditModal(feed)} />

            {searchFilteredArticles(filteredArticles[feed.id] || []).map(
              (article) => (
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
              )
            )}
          </View>
        ))}
      </ScrollView>

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
});
