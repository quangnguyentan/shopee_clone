"use client";

import i18n from "@/src/lib/locale";
import { useEffect, useMemo, useRef, useState } from "react";
import { CiSearch, LuShoppingCart, useShopeeLogo } from "./Icon";
import TopBar from "./TopBar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {
  useGetTodayTopSearchQuery,
  useSuggestKeywordQuery,
} from "@/src/common/api/seach-log.api";

export const HEADER_HEIGHT = 119;

const Header = () => {
  const router = useRouter();
  const { isAuthRoute, location, logo } = useShopeeLogo();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const { data: topKeywords = [] } = useGetTodayTopSearchQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** debounce keyword */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);
  }, [keyword]);

  /** close suggest when click outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowSuggest(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: suggestions = [], isFetching } = useSuggestKeywordQuery(
    debouncedKeyword,
    { skip: !debouncedKeyword },
  );

  const handleSearch = (q?: string) => {
    const value = (q ?? keyword).trim();
    if (!value) return;

    setShowSuggest(false);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const renderTitle = useMemo(() => {
    if (location.includes("/buyer/login")) {
      return i18n.get("pages.auth.header.login.title");
    }
    if (location.includes("/buyer/signup")) {
      return i18n.get("pages.auth.header.register.title");
    }
    return i18n.get("pages.auth.header.verify.title");
  }, [location]);

  if (isAuthRoute) {
    return (
      <header>
        <div className="h-20 px-6 lg:px-24 max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {logo}
            <h1 className="text-2xl font-normal">{renderTitle}</h1>
          </div>
          <span className="text-red-primary">
            {i18n.get("pages.auth.header.you-need-to-help.title")}
          </span>
        </div>
      </header>
    );
  }

  return (
    <div className="bg-red-gradient fixed w-full z-50">
      <header className="h-[119px] px-12 max-w-screen-xl mx-auto flex flex-col">
        <TopBar />

        <div className="flex items-center justify-between h-full gap-8">
          <div className="flex-[1.5]">{logo}</div>

          {/* SEARCH */}
          <div
            className="flex-7 flex flex-col gap-1 translate-y-1"
            ref={containerRef}
          >
            <div className="relative w-full">
              <Input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowSuggest(true);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={i18n.get("pages.home.header.search.placeholder")}
                className="bg-white rounded-sm py-5 px-3 w-full pr-20"
              />

              <Button
                onClick={() => handleSearch()}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-red-primary w-16 h-9 rounded-sm"
              >
                <CiSearch color="white" size={18} />
              </Button>

              {showSuggest && debouncedKeyword && (
                <div className="absolute top-full left-0 w-full bg-white border shadow-md z-50">
                  {isFetching && (
                    <div className="px-4 py-2 text-sm text-gray-400">
                      Đang tìm...
                    </div>
                  )}

                  {!isFetching && suggestions.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400">
                      Không có gợi ý
                    </div>
                  )}

                  {suggestions?.map((item) => (
                    <div
                      key={item.keyword}
                      onClick={() => handleSearch(item.keyword)}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                    >
                      {item.keyword}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 text-white text-xs">
              {topKeywords.slice(0, 5).map((item) => (
                <span
                  key={item.keyword}
                  className="cursor-pointer hover:underline"
                  onClick={() => handleSearch(item.keyword)}
                >
                  {item.keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <LuShoppingCart color="white" className="w-7 h-7" />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
