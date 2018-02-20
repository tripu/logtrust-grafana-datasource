Grafana Datasource for Logtrust
-----

This datasource was created to connect Grafana with Logtrust, and launch Querys
to draw the information storage in Logtrust.

Based on Grafana Simple JSON Datasource plugin.

Getting started instruction
---

Manual adding the data source to Grafana (with rebuilding)
Prerequisites: You should have Grafana and npm installed and have permissions to copy data to Plugins folder(you could set it in grafana.ini in Paths->plugins).

Clone this repo to Plugins folder - git clone https://github.com/Logtrust/logtrust-grafana-datasource.git;

Go into folder 

	cd logtrust-grafana-datasource;

Install all packages

	npm install;

Build plugin 
	
	npm run build;

Restart Grafana 

	sudo service grafana-server restart;
	
Open Grafana in any browser;

Open the side menu by clicking the Grafana icon in the top header;

In the side menu click Data Sources;

Click the + Add data source in the top header;

Select Logtrust from the Type dropdown;

#### Configure datasource

SetUp the Api Uri, this is the table of API servers currently avaliable

| Region | Url |
|--------|-----|
| USA | https://api-us.logtrust.com/search/ |

Get your credencials [Documentation]( https://docs.logtrust.com/confluence/docs/system-configuration/relays/credentials )

and setUp **Api Key** and **Api Secret**



### Using the data source in Dashboards

Open Grafana in any browser;

Open the side menu by clicking the Grafana icon in the top header;

In the side menu find Dashboards and in context menu click + New;

Select Panel type from top header.

Click on Panel Title and choose Edit;

In Metrics tab choose your data source name from Panel Data Source;

Introduce the QueryId or a LinQ query you want to launch. [Query Documentation](https://docs.logtrust.com/confluence/docs/data-search)

If the Query contains several stadistics, you can select which one to show in the Metrics Section. 

