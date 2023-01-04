import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import Searchbar from 'components/Searchbar/Searchbar';
import { Container } from 'components/App/App.styled';
import ImgGallery from 'components/ImageGallery/ImageGallery';
import { fetchResult } from 'Services/Api';
import Loader from 'components/Loader/Loader';
import Button from 'components/Button/Button';
import ModalBox from 'components/Modal/Modal';

const App = () => {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalHits, setTotalHits] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!query) {
      return;
    }
    async function fetshBase() {
      try {
        setLoading(true);
        const { hits, totalHits } = await fetchResult(query, page);
        if (!totalHits) {
          toast.success(`Nothing found for your request :${query}`);
          return;
        }
        const images = hits.map(
          ({ tags, id, webformatURL, largeImageURL }) => ({
            tags,
            id,
            webformatURL,
            largeImageURL,
          })
        );
        setHits(prevHits => [...prevHits, ...images]);
        setTotalHits(totalHits);
      } catch (error) {
        toast.error('Something went wrong : Try reloading the page.');
      } finally {
        setLoading(false);
      }
    }
    fetshBase();
  }, [query, page]);
  const handleSubmit = newQuery => {
    if (newQuery === query) {
      toast.success(
        `You have already entered the query :${query}.
        Please refresh the page and try again, or enter a different query.`
      );
      return;
    }
    setQuery(newQuery);
    setHits([]);
    setPage(1);
    setTotalHits(0);
  };

  const incrementImage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const selectImage = imageURL => setSelectedImage(imageURL);

  const closeImage = () => setSelectedImage(null);

  return (
    <>
      <Container>
        <Searchbar handleSubmit={handleSubmit} />

        {hits.length > 0 && (
          <ImgGallery selectImage={selectImage} hits={hits} />
        )}

        {Boolean(totalHits) && totalHits !== hits.length && !loading && (
          <Button loadMoreProp={incrementImage} />
        )}
        {loading && <Loader isLoading={loading} />}
        {selectedImage !== null && (
          <ModalBox selectedImage={selectedImage} closeImage={closeImage} />
        )}
        <Toaster position="top-center" />
      </Container>
    </>
  );
};

export default App;
