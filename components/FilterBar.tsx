import { AntDesign } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

import { LABEL_CATEGORIES } from '../components/ForumPostsList';

import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { useFilterStore } from '~/store/filterStore';

export const FilterBar = () => {
  const filterSheetRef = useSheetRef();
  const { sortBy, selectedTags } = useFilterStore();

  const openFilterSheet = () => {
    filterSheetRef.current?.present();
  };

  return (
    <>
      <View className="border-accent/10 flex-row items-center justify-between border-b bg-card px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Pressable
            onPress={openFilterSheet}
            className="mr-2 flex-row items-center space-x-2 rounded-full bg-[#dfcfbd]/30 px-3 py-1.5">
            <AntDesign name="filter" size={16} color="#8b7355" />
            <Text className="text-sm font-medium text-[#5c4d3d]">
              {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Text>
          </Pressable>

          {selectedTags.map((tag) => (
            <Pressable key={tag} className="mr-2 rounded-full bg-[#dfcfbd]/20 px-3 py-1.5">
              <Text className="text-sm text-[#5c4d3d]">{tag}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <Sheet ref={filterSheetRef} snapPoints={['70%']} enablePanDownToClose index={-1}>
        <FilterSheet />
      </Sheet>
    </>
  );
};

const FilterSheet = () => {
  const {
    sortBy,
    sortOrder,
    selectedTags,
    setSortBy,
    setSortOrder,
    setSelectedTags,
    clearFilters,
  } = useFilterStore();

  const sortOptions = [
    { label: 'Trending', value: 'trending' },
    { label: 'Latest', value: 'latest' },
    { label: 'Most Liked', value: 'top' },
    { label: 'Most Comments', value: 'comments' },
  ];

  return (
    <BottomSheetScrollView>
      <View className="p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-[#5c4d3d]">Sort & Filter</Text>
          <Pressable onPress={clearFilters}>
            <Text className="text-sm text-[#8b7355]">Reset</Text>
          </Pressable>
        </View>

        <View className="mt-4">
          <Text className="mb-2 font-medium text-[#5c4d3d]">Sort By</Text>
          <View className="space-y-2">
            {sortOptions.map((option) => (
              <Pressable
                key={option.value}
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                onPress={() => setSortBy(option.value as any)}
                className={`rounded-lg border border-[#dfcfbd]/20 p-3 ${
                  sortBy === option.value ? 'bg-[#dfcfbd]/30' : 'bg-card'
                }`}>
                <Text className="text-[#5c4d3d]">{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4">
          <Text className="mb-2 font-medium text-[#5c4d3d]">Order</Text>
          <View className="flex-row space-x-2">
            {['desc', 'asc'].map((order) => (
              <Pressable
                key={order}
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                onPress={() => setSortOrder(order as any)}
                className={`flex-1 rounded-lg border border-[#dfcfbd]/20 p-3 ${
                  sortOrder === order ? 'bg-[#dfcfbd]/30' : 'bg-card'
                }`}>
                <Text className="text-center text-[#5c4d3d]">
                  {order === 'desc' ? 'Descending' : 'Ascending'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-4">
          <Text className="mb-2 font-medium text-[#5c4d3d]">Filter by Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {LABEL_CATEGORIES.map((tag) => (
              <Pressable
                key={tag}
                onPress={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter((t) => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`rounded-full border border-[#dfcfbd]/20 px-3 py-1.5 ${
                  selectedTags.includes(tag) ? 'bg-[#dfcfbd]/30' : 'bg-card'
                }`}>
                <Text className="text-[#5c4d3d]">{tag}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </BottomSheetScrollView>
  );
};
