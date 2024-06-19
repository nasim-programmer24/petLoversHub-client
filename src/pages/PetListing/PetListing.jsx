import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import useAxiosCommon from "../../hooks/useAxiosCommon";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const PetListing = () => {
  const axiosCommon = useAxiosCommon();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const { ref, inView } = useInView();
  const [limit, setLimit] = useState(10);

  const fetchPets = async ({ pageParam = 0 }) => {
    const { data } = await axiosCommon.get(`/available-pets`, {
      params: { search, category, page: pageParam, limit: limit },
    });
    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["pets", search, category],
      queryFn: fetchPets,
      getNextPageParam: (lastPage) => lastPage.nextPage,
    });

  useEffect(() => {
    if (inView && hasNextPage) {
      setLimit(4);
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const renderSkeletons = (count) => {
    return Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className='p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'>
        <Skeleton height={160} />
        <Skeleton
          height={30}
          width={`60%`}
          style={{ marginTop: 10, marginBottom: 10 }}
        />
        <Skeleton height={20} width={`80%`} />
        <Skeleton height={20} width={`40%`} style={{ marginTop: 10 }} />
        <Skeleton height={40} width={`50%`} style={{ marginTop: 10 }} />
      </div>
    ));
  };

  return (
    <>
      <Helmet>
        <title>PetLoversHub || Pet-Listing</title>
      </Helmet>
      <h3 className='text-3xl mb-4 text-center dark:text-white'>
        Here is the List of Available Pet for Adopted
      </h3>
      <div className='flex flex-col gap-5 md:gap-0 my-6 md:my-12 md:flex-row items-center justify-center'>
        <input
          type='text'
          value={search}
          className='md:rounded-l-md'
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search pets by name'
        />
        <select
          className='rounded-r-md'
          value={category}
          onChange={(e) => setCategory(e.target.value)}>
          <option value=''>All Categories</option>
          <option value='Cat'>Cat</option>
          <option value='Bird'>Bird</option>
          <option value='Rabbit'>Rabbit</option>
          <option value='Dog'>Dog</option>
          <option value='Fish'>Fish</option>
          <option value='Other'>Other</option>
        </select>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 justify-around w-full'>
        {isLoading
          ? renderSkeletons(10) // Render 10 skeletons initially
          : data?.pages.map((page, pageIndex) => (
              <React.Fragment key={pageIndex}>
                {page.pets.map((pet) => (
                  <React.Fragment key={pet._id}>
                    <div className='p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700'>
                      <img
                        className='rounded-t-lg h-48 w-full'
                        src={pet?.petImage}
                        alt={pet?.petName}
                      />
                      <h4 className='mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white'>
                        Pet Name:{" "}
                        <span className='text-blue-500'>{pet?.petName}</span>
                      </h4>
                      <p className='mb-3 font-medium text-gray-700 dark:text-gray-400'>
                        Pet Age:{" "}
                        <span className='text-green-500'>
                          {pet?.petAge} months
                        </span>
                      </p>
                      <p className='text-teal-500'>
                        Location: {pet?.petLocation}
                      </p>
                      <Link to={`/pet-details/${pet?._id}`}>
                        <button className='mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'>
                          View Details
                        </button>
                      </Link>
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
      </div>
      {isFetchingNextPage && (
        <p className='text-lg md:text-xl my-6'>Loading more pets...</p>
      )}
      {!hasNextPage && (
        <p className='text-xl text-center md:text-2xl my-6'>
          No More Pets Card to Show
        </p>
      )}
      <div ref={ref}></div>
    </>
  );
};

export default PetListing;
