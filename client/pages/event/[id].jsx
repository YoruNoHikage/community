import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AspectRatioBox, Image, Box, Grid, Heading, Text, Spinner, Stack } from '@chakra-ui/core';
import { Map, TileLayer, Marker } from 'react-leaflet-universal';
import Error from 'next/error';

import Navigation from '../../components/Navigation';
import GameCard from '../../components/GameCard';
import OrgCard from '../../components/OrgCard';
import EventCard from '../../components/EventCard';

const eventQuery = gql`
  query event($id: UUID!) {
    event(id: $id) {
      id
      name
      about
      site
      startsAt
      endsAt

      location {
        id
        country
        city
        latitude
        longitude
      }

      entities {
        totalCount
        nodes {
          id
          name
        }
      }

      games {
        totalCount
        nodes {
          id
          name
          images {
            nodes {
              id
            }
          }
        }
      }
    }
  }
`;

const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

const Event = () => {
  const router = useRouter();
  const { id } = router.query;

  const validId = uuidRegex.test(id);

  const { loading, error, data } = useQuery(eventQuery, {
    variables: { id },
    skip: !validId,
  });
  const relatedEvents = [];

  if ((id !== undefined && !validId) || error) {
    return <Error statusCode={404} />;
  }

  if (loading || !validId) {
    return <Spinner />;
  }

  const {
    name,
    // about,
    site,
    startsAt,
    endsAt,
    location,
    entities,
    games,
    cover,
  } = data.event;

  const about = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque tortor sem, sodales in sapien eu, feugiat accumsan nunc. Vestibulum varius leo eget sapien lobortis malesuada. Aenean sed ultrices mi, quis tempus velit. Nunc consequat sapien non quam euismod auctor. Nam hendrerit nisl tellus, consectetur aliquam magna fermentum vel. Suspendisse at ultrices tellus. Aenean faucibus eu justo id commodo. Morbi erat lectus, fermentum eu enim a, vehicula pharetra diam. Quisque blandit lorem id ex euismod, sed sagittis diam volutpat. Vivamus vestibulum nunc sapien, et tristique magna aliquet sed. Aliquam tellus magna, consectetur non condimentum eu, egestas id sem. Cras sit amet velit nisi. Maecenas accumsan elit eu turpis tincidunt, et ultricies odio egestas.

Donec finibus erat vitae velit vulputate, eget porta turpis semper. Etiam molestie fringilla augue sit amet maximus. Nullam volutpat, arcu non lacinia mollis, sem velit ultricies velit, ac convallis nisl nulla at lacus. Duis sed ipsum ac diam pretium congue. Aenean ac imperdiet dui. Nam posuere ultrices nibh, vitae dictum quam suscipit quis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum mattis sollicitudin arcu.

Morbi in placerat velit, eu fermentum ante. Ut sed odio lacus. Phasellus ultricies at nibh sed scelerisque. Etiam auctor arcu scelerisque, porta dui quis, pretium enim. Suspendisse accumsan nisl vel sapien rhoncus lobortis. Sed quis mi ac neque venenatis sodales. Nam id leo lacus. Cras eu ante vulputate, scelerisque velit vel, sagittis massa. Aenean mauris urna, porta eu lectus a, pretium ornare massa.

Donec ex neque, mollis non enim ut, bibendum hendrerit est. Nullam ut imperdiet erat. Duis tincidunt purus quam, et aliquet purus aliquet eget. Nullam in faucibus lorem. In suscipit congue tempus. Duis quam quam, tristique vel ex vel, facilisis ultricies sem. Aenean bibendum risus orci, nec maximus velit accumsan eget. Integer elementum convallis augue congue congue. Maecenas at suscipit nisl. Praesent et sem laoreet, pharetra augue in, pretium metus. Curabitur congue malesuada cursus. Nunc sem neque, blandit id orci in, euismod iaculis nisl. Etiam pulvinar dui ut leo pharetra venenatis. Pellentesque sed libero purus.

Nunc pharetra libero aliquam ligula tincidunt, ut mollis mauris gravida. Fusce in tempus justo. Nulla nulla nisl, facilisis in ligula eu, dictum tincidunt nisi. Duis non semper ex. Phasellus ut aliquet odio, at ornare urna. Nunc vulputate odio a tortor tincidunt eleifend. Donec nec lacus egestas, ullamcorper nulla vitae, maximus purus. Sed ut quam ante. Phasellus at tincidunt massa. Nunc egestas aliquet tincidunt. Maecenas interdum augue eu risus imperdiet, at venenatis quam vehicula. Phasellus cursus id ipsum ut tristique. 
  `

  return (
    <div>
      <Navigation />

      <Grid templateColumns="2fr 1fr" gap={6} mt={10}>
        <Box flex={2}>
          <AspectRatioBox ratio={3}>
            <Image
              size="100%"
              objectFit="cover"
              src={cover}
              alt="Event cover"
              fallbackSrc="https://via.placeholder.com/800x300?text=Event cover"
            />
          </AspectRatioBox>

          <Box mb={5}>
            <Grid gridTemplateColumns="5rem 1fr" mb={2}>
              <Heading gridColumn="2 / 3" textAlign="right">{name}</Heading>
              <Text textAlign="center" fontWeight="bold" gridColumn="1 / 2" gridRow="1 / 3" as="time" datetime={startsAt}>
                <Box as="span" fontSize="3xl" display="block">3</Box>
                <Box as="span">mai 2019</Box>
              </Text>
              <Text gridColumn="2 / 3" textAlign="right">11 rue du Manoir de Sévigné, Rennes, France</Text>
            </Grid>

            <Head>
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
  crossorigin=""/>
            </Head>

            {location.latitude && location.longitude && (
              <div style={{width: '100%', height: '200px'}}>
                <Map center={[51.505, -0.09]} zoom={13}>
                  <>
                    <TileLayer
                      attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                      url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    />
                    {/* <Marker position={[location.latitude, location.longitude]} /> */}
                  </>
                </Map>
              </div>
            )}
          </Box>

          {about && <Box mb={5}>
            <Heading as="h3" fontSize="2xl">Description</Heading>
            <Text>
              {about}
            </Text>
          </Box>}

          <Box mb={5}>
            <Heading size="md" mb={2}>
              Games
            </Heading>
            <Box overflowX="auto">
              {games.nodes.map(({ id, name, images }) => (
                <Box display="inline-block" mr={4}>
                  <GameCard key={id} id={id} name={name} images={images.nodes} />
                </Box>
              ))}
            </Box>
          </Box>

          <Box>
            <Heading size="md" mb={2}>
              Hosts
            </Heading>
            <Box
              display="grid"
              gridTemplateColumns="33% 33% 33%"
              gridColumnGap={3}
              gridRowGap={3}
            >
              {entities.nodes.map(({ id, name, images }) => (
                <OrgCard key={id} id={id} name={name} images={images.nodes} />
              ))}
            </Box>
          </Box>
        </Box>

        <Box>
          <Heading>Related events</Heading>
          <Stack>
            {relatedEvents.length > 0 ? relatedEvents.map(event => <EventCard {...event} />) : <Text>No related events.</Text>}
          </Stack>
        </Box>
      </Grid>
    </div>
  );
};

export default Event;
