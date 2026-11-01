import { useState } from 'react';
import {
    Badge,
    Box,
    Card,
    Center,
    Container,
    Flex,
    Heading,
    NativeSelect,
    SimpleGrid,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';
import { Header } from '../../components/ui/Header.jsx';
import PriceChart from '../../components/ui/PriceChart.jsx';
import CoinIcon from '../../components/ui/CoinIcon.jsx';
import { useCryptoPrices } from '../../hooks/useCryptoPrices.js';
import { useCryptoHistory } from '../../hooks/useCryptoHistory.js';
import { CATEGORIES, COINS, formatPrice } from '../../constants/coins.js';
import './ChartsPage.css';

const RANGES = [
    { value: '1h:24', label: 'Last 24 hours' },
    { value: '1d:30', label: 'Last 30 days' },
    { value: '1m:60', label: 'Last hour' },
];

function CoinCard({ symbol, name, brandColor, points, live }) {
    const isUp = live ? live.change >= 0 : true;
    const color = isUp ? 'green.400' : 'red.400';

    const series = live && points.length > 0
        ? [...points.slice(0, -1), { ...points[points.length - 1], price: live.price }]
        : points;

    return (
        <Card.Root as="article">
            <Card.Body>
                <Flex className="charts-page__coin-header">
                    <Flex className="charts-page__coin-name">
                        <CoinIcon symbol={symbol} color={brandColor} />

                        <Box>
                            <Heading size="md">{symbol.replace('USDT', '')}</Heading>

                            <Text className="charts-page__coin-subtitle">
                                {name}
                            </Text>
                        </Box>
                    </Flex>

                    <Box className="charts-page__coin-price">
                        <Text className="charts-page__coin-price-value">
                            {live ? `$${formatPrice(live.price)}` : '—'}
                        </Text>

                        {live && (
                            <Badge colorPalette={isUp ? 'green' : 'red'} variant="subtle">
                                {isUp ? '▲' : '▼'} {Math.abs(live.change).toFixed(2)}%
                            </Badge>
                        )}
                    </Box>
                </Flex>

                <PriceChart points={series} color={color} />
            </Card.Body>
        </Card.Root>
    );
}

function ChartsPage() {
    const [range, setRange] = useState('1h:24');
    const [interval, limit] = range.split(':');

    const prices = useCryptoPrices();
    const { history, loading } = useCryptoHistory(interval, Number(limit));

    return (
        <Container className="charts-page">
            <Header />

            <Flex className="charts-page__toolbar">
                <Flex className="charts-page__toolbar-start">
                </Flex>

                <NativeSelect.Root size="sm" className="charts-page__range">
                    <NativeSelect.Field
                        value={range}
                        onChange={(event) => setRange(event.target.value)}
                    >
                        {RANGES.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
            </Flex>
            
            {loading ? (
                <Center className="charts-page__loading">
                    <Spinner size="lg" />
                </Center>
            ) : (
                <Stack className="charts-page__categories">
                    {CATEGORIES.map(({ id, label }) => (
                        <Box key={id} as="section">
                            <Heading size="sm" className="charts-page__category-title">
                                {label}
                            </Heading>

                            <SimpleGrid className="charts-page__grid">
                                {COINS.filter((coin) => coin.category === id).map(
                                    ({ symbol, name, color }) => (
                                        <CoinCard
                                            key={symbol}
                                            symbol={symbol}
                                            name={name}
                                            brandColor={color}
                                            points={history[symbol] ?? []}
                                            live={prices[symbol]}
                                        />
                                    )
                                )}
                            </SimpleGrid>
                        </Box>
                    ))}
                </Stack>
            )}
        </Container>
    );
}

export default ChartsPage;
