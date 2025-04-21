import React, { useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useFavoritesManager } from "@/hooks/useFavoritesManager";
import { EmptyFavorites } from "@/components/EmptyFavorites";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import { ArticleCard } from "@/components/ArticleCard";

export default function Favorites() {
  const { favoriteArticles, loading, fetchFavorites, removeFromFavorites } =
    useFavoritesManager();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  if (loading) return <LoadingIndicator />;

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
    color: Colors.text,
  },
});
