import React from 'react';
import HeroCard from '@/components/about/HeroCard';
import StorySection from '@/components/about/StorySection';
import FeatureList from '@/components/about/FeatureList';
import BuildCta from '@/components/about/BuildCta';

export default function About() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6 max-w-2xl mx-auto lg:mx-0">
      <HeroCard />
      <StorySection />
      <FeatureList />
      <BuildCta />
    </div>
  );
}