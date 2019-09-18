# Grafana datasource for Devo

*Connect [Grafana](https://grafana.com/) to [Devo](https://www.devo.com/)*

## Configure datasource

Set up the API URI.
This is the table of API servers currently avaliable;
cf [*&ldquo;Security credentials &rarr; Access keys&rdquo;*](https://docs.devo.com/confluence/ndt/api-reference/rest-api)

Get your credentials
([*&ldquo;REST API&rdquo;*](https://docs.devo.com/confluence/ndt/domain-administration/security-credentials#Securitycredentials-access_keys))
and enter the API key and the API secret.

## Using the data source in Dashboards

Open Grafana in any browser;

Open the side menu by clicking the Grafana icon in the top header;

In the side menu find Dashboards and in context menu click + New;

Select Panel type from top header.

Click on Panel Title and choose Edit;

In Metrics tab choose your data source name from Panel Data Source;

Introduce the QueryId or a LinQ query you want to launch; cf [*&ldquo;Searching data&rdquo;*](https://docs.devo.com/confluence/ndt/searching-data)

If the query contains several statistics, you can select which one to show in the Metrics Section. 
