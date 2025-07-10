"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import SearchResults from './search-results';

interface Photographer {
  id: string;
  name: string;
  image: string;
  price: string;
  location: string;
  specialty: string;
  experience: string;
  rating: string;
}

function SearchResultsPage() {
  return (
    <>
      <SearchResults />
    </>
  );
}

export default SearchResultsPage;
