import React, { useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useFavoritesManager } from "@/hooks/useFavoritesManager";
import { EmptyFavorites } from "@/components/EmptyFavorites";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import { ArticleCard } from "@/components/ArticleCard";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useScrollToTop } from "@/hooks/useScrollToTop"; // Nasz customowy hook
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Favorites() {
  const { favoriteArticles, loading, fetchFavorites, removeFromFavorites } =
    useFavoritesManager();
  const isMobile = useIsMobile();
  
  const router = useRouter();

  const { scrollViewRef, scrollHandler, scrollToTop, scrollToTopStyle } =
    useScrollToTop();

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );
  

  if (loading) return <LoadingIndicator />;

  return (
    <>
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.container}
        onScroll={scrollHandler}
        scrollEventThrottle={16}>
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
            <EmptyFavorites />
          ) : (
            favoriteArticles.map((article) => (
              <ArticleCard
                key={article.guid}
                article={article}
                variant="favorite"
                onPress={() => {
                  router.push({
                    pathname: "../article",
                    params: {
                      title: article.title,
                      pubDate: article.pubDate,
                      content: article.content,
                      link: article.link,
                      from: "favorites",
                    },
                  });
                }}
                onToggleFavorite={() =>
                  removeFromFavorites(article.feedId!, article.guid)
                }
              />
            ))
          )}
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={[styles.scrollToTop, scrollToTopStyle]}>
        <TouchableOpacity onPress={scrollToTop}>
          <Text style={styles.scrollToTopText}>↑</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
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
    color: Colors.text,
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
