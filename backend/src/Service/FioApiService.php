<?php

namespace App\Service;

use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class FioApiService
{
    private const FIO_API_BASE_URL = 'https://fioapi.fio.cz/v1/rest';

    public function __construct(
        private HttpClientInterface $client,
        private string $fioApiToken,
        private LoggerInterface $logger
    ) {}

    /**
     * Fetches new transactions since the last time this function was successfully called.
     * This uses the /last/ endpoint, which is the most efficient method.
     *
     * @return array An array of transactions, or an empty array on failure.
     */
    public function fetchNewTransactions(): array
    {
        $url = sprintf(
            '%s/last/%s/transactions.json',
            self::FIO_API_BASE_URL,
            $this->fioApiToken
        );

        try {
            $response = $this->client->request('GET', $url);
            // return $response->toArray();

            if ($response->getStatusCode() === 409) {
                $this->logger->warning('Fio API rate limit hit. Asking for data too frequently.');
                return [];
            }

            if ($response->getStatusCode() !== 200) {
                $this->logger->error('Fio API returned a non-200 status code.', [
                    'status_code' => $response->getStatusCode(),
                    'response' => $response->getContent(false),
                ]);
                return [];
            }

            $data = $response->toArray();

            return $data['accountStatement']['transactionList']['transaction'] ?? [];
        } catch (\Exception $e) {
            $this->logger->critical('Failed to fetch data from Fio API.', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return [];
        }
    }
}
