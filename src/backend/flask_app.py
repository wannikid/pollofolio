from flask import Flask, request
from flask_cors import CORS
from datetime import date
from datetime import datetime
import urllib.request
import json
import pandas as pd
import datetime
import os
import numpy as np


class Asset:
    def __init__(self, assetDict):

        if '_name' in assetDict:
            self.name = str(assetDict['_name'])
        else:
            self.name = None

        if '_ticker' in assetDict:
            self.ticker = str(assetDict['_ticker'])
        else:
            self.ticker = None

        if '_id' in assetDict:
            self.id = str(assetDict['_id'])
        else:
            self.id = ""

        if self.ticker is None:
            self.columnID = self.id
        else:
            self.columnID = self.ticker + self.id

        if '_dateBuy' in assetDict and assetDict['_dateBuy'] != None:
            # assuming the date received is an ISO formatted string take only the first 10 characters YYYY-MM-DD
            self.dateBuy = assetDict['_dateBuy'][:10]
        else:
            self.dateBuy = None

        if '_amount' in assetDict and assetDict['_amount']:
            self.amount = float(assetDict['_amount'])
        else:
            self.amount = None

        if '_totalBuy' in assetDict and assetDict['_totalBuy']:
            self.totalBuy = float(assetDict['_totalBuy'])
        else:
            self.totalBuy = None

        if '_totalSell' in assetDict and assetDict['_totalSell']:
            self.totalSell = float(assetDict['_totalSell'])
        else:
            self.totalSell = None

        if '_dateSell' in assetDict and assetDict['_dateSell'] != None:
            # assuming the date received is an ISO formatted string take only the first 10 characters YYYY-MM-DD
            self.dateSell = assetDict['_dateSell'][:10]
        else:
            self.dateSell = None

        if '_timeseries' in assetDict:
            self.timeseries = assetDict['_timeseries']
        else:
            self.timeseries = {}

        if '_payouts' in assetDict:
            # assuming payouts is a list of dictionaries
            self.payouts = assetDict['_payouts']
        else:
            self.payouts = []

        self.messages = {}


    # function to convert a timeseries from list of lists into a pandas dataframe
    def toDataframe(self):
        try:
            if len(self.timeseries) == 0:
                # extrapolate data if timeseries is empty
                if self.dateSell and self.totalSell and self.amount and self.totalBuy:
                    endDate = pd.to_datetime(self.dateSell)
                    data = {
                        self.columnID:
                        [self.totalBuy / self.amount, self.totalSell / self.amount]
                    }
                elif self.totalBuy and self.amount and self.totalBuy:
                    endDate = datetime.datetime.today()
                    data = {
                        self.columnID:
                        [self.totalBuy / self.amount, self.totalBuy / self.amount]
                    }

                df = pd.DataFrame(data, index=[pd.to_datetime(self.dateBuy), endDate])
                df = df.reindex(pd.date_range(pd.to_datetime(self.dateBuy), endDate))
                df = df.interpolate(method='linear', axis=0).ffill().bfill()
                df.index.names = ['timestamp']
            else:
                df = pd.DataFrame.from_dict(self.timeseries, orient='index', columns=[self.columnID])
                df.index = pd.to_datetime(df.index)
                df.index.names = ['timestamp']

            df = df.sort_index()
            return df
        # catch the error when no table exists in the database for this stock
        except Exception as e:
            raise Exception('Error in function toDataframe(): ' + str(e) + str(self.timeseries))


app = Flask(__name__)
# allow cross origin requests to the backend, e.g. from codesandbox
CORS(app) 

@app.after_request
def add_header(response):
    # advise the server to cache the responses for 30 min
    response.cache_control.max_age = 1800
    # allow caching of GET responses by CDN
    response.cache_control.public = True
    return response


@app.route("/insights", methods=["POST"])
def insights():

    stockList = []
    charts = {}
    errorLog = "start"
    try:
        # read json and ignore missing content-type
        try:
            statsInput = request.get_json(force=True)
        except Exception:
            raise Exception('Error caused by get_json')

        errorLog = "between: " + str(statsInput)

        for stock in statsInput['stocks']:
            stock = Asset(stock)
            errorLog = "after stock object creation: " + str(stock.__dict__)
            stockList.append(stock)
            
        dfPortfolio = generatePortfolioData(stockList, taxes=float(statsInput['taxes']))    
        return dfPortfolio.to_json(orient='columns', date_format="iso")

    except Exception as ex:
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        return json.dumps('An error in insights(): ' + message + errorLog)


# function to query portfolio statistics
def generatePortfolioData(stocks, taxes):

    errorLog = ""
    try:
        errorLog = "1st stock " + str(stocks[0].dateBuy)
        errorLog = "stock as dict " + json.dumps(stocks[0].__dict__, default=str)
        stocks = sorted(stocks, key=lambda k: k.dateBuy)
        errorLog = "stocks sorted: " + str(stocks)
        dates = pd.date_range(stocks[0].dateBuy, datetime.datetime.now())
        dfPortfolio = pd.DataFrame({ 'timestamp': dates }).set_index('timestamp')
        dfPrices = pd.DataFrame(index=dfPortfolio.index)
        dfNormed = pd.DataFrame(index=dfPortfolio.index)
        totalBuyArr = np.array([])

        # gather price data and normalize it
        for stock in stocks:
                df = stock.toDataframe()
                errorLog = "toDataframe: " + str(df)
                dfPrices = pd.merge(dfPrices, df, left_index=True, right_index=True, how='outer')
                dfPrices[stock.columnID].loc[stock.dateBuy:stock.dateSell].fillna(method='ffill',inplace=True)
                errorLog = "prices: " + str(dfPrices)
                dfNormed = pd.merge(dfNormed, df.iloc[:] / df.iloc[0], left_index=True, right_index=True, how='outer')
                dfNormed[stock.columnID].loc[stock.dateBuy:stock.dateSell].fillna(method='ffill',inplace=True)
                totalBuyArr = np.append(totalBuyArr, [stock.totalBuy])


        #dfPrices.fillna(0, inplace=True)    
        dfNormed.fillna(0, inplace=True)
        errorLog = 'dfNormed: ' + str(dfNormed)

        dfInvested = dfNormed/dfNormed * totalBuyArr
        dfInvested.fillna(0, inplace=True)
        dfPortfolio['Invested EUR'] = round(dfInvested.sum(axis=1), 2)
        errorLog = 'dfInvested: ' + str(dfInvested)

        dfMarketValue = dfNormed * totalBuyArr
        dfMarketValue.fillna(0, inplace=True)
        dfPortfolio['Market value EUR'] = round(dfMarketValue.sum(axis=1), 2)
        errorLog = 'dfMarketValue: ' + str(dfMarketValue)

        dfWeights = dfMarketValue.div(dfMarketValue.sum(axis=1), axis=0)
        dfPortfolio['Weights'] = round(dfWeights.sum(axis=1), 2)
        errorLog = 'dfWeights: ' + str(dfWeights)

        dfAlloced = dfNormed * dfWeights
        errorLog = 'dfAlloced: ' + str(dfAlloced)

        dfPortfolio['Change EUR'] = dfMarketValue.sum(axis=1) - dfInvested.sum(axis=1)
        errorLog = 'Change EUR: ' + str(dfPortfolio['Change EUR'])

        dfPortfolio['Daily change %'] = (dfPrices.pct_change() * dfWeights).sum(axis=1)
        dfPortfolio['Daily change %'].fillna(0, inplace=True)
        errorLog = 'Daily change %: ' + str(dfPortfolio['Daily change %'])

        dfPortfolio['Change %'] = round((1 + dfPortfolio['Daily change %']).cumprod() - 1, 4)
        errorLog = 'Change %: ' + str(dfPortfolio['Change %'])

        dfPortfolio['Daily change EUR'] = round((dfInvested.sum(axis=1) * dfPortfolio['Daily change %']), 2)
        errorLog = 'Daily change EUR: ' + str(dfPortfolio['Daily change EUR'])

        dfPortfolio['GainLoss EUR'] = 0.0
        for stock in stocks:
            if stock.dateSell:
                dfPortfolio['GainLoss EUR'].loc[pd.to_datetime(stock.dateSell)] += (stock.totalSell - stock.totalBuy)

        dfPortfolio['GainLossCum EUR'] = dfPortfolio['GainLoss EUR'].cumsum()
        errorLog = "GainLoss EUR " + str(dfPortfolio['GainLoss EUR'])

       # calculate the ROI in EUR only for the payouts
        dfPortfolio['Payouts EUR'] = 0.0
        dfPortfolio['Cashflow EUR'] = 0.0
        for stock in stocks:
            errorLog = "in stock loop" + json.dumps(stock.__dict__, default=str)
            dfPortfolio['Cashflow EUR'].loc[pd.to_datetime(stock.dateBuy)] += stock.totalBuy
            if stock.dateSell:
                # the negative cashflow is occuring one day after the transaction
                dfPortfolio['Cashflow EUR'].loc[pd.to_datetime(stock.dateSell):][1] -= stock.totalSell
            for date in stock.payouts:
                dfPortfolio['Payouts EUR'].loc[pd.to_datetime(date)] += float(stock.payouts[date]['value'])
                dfPortfolio['Cashflow EUR'].loc[pd.to_datetime(date)] += float(stock.payouts[date]['value'])
        errorLog = "after payouts " + str(dfPortfolio['Payouts EUR'])
        errorLog = 'Cashflow EUR: ' + str(dfPortfolio['Cashflow EUR'])
        
        # set artifical cashflow on last day to calculate total portfolio time-weighted return
        #dfPortfolio['Cashflow EUR'].iloc[-1] = 0.001

        # Calculate Time-weighted return of portfolio
        dfPortfolio['TWR %'] = 0.0
        dfPortfolio['TWR Norm'] = 1.0
        dfTWRRperiods = dfPortfolio.loc[dfPortfolio['Cashflow EUR'] != 0]
        i = 0
        for index, row in dfTWRRperiods.iterrows():
            if i == 0:
                periodReturn = 1
            elif i > 0:
                # check the case where the portfolio market value is 0
                if dfTWRRperiods.iloc[i - 1]['Market value EUR'] != 0:
                    periodReturn = (
                        dfPortfolio['Market value EUR'].loc[index] -
                        dfPortfolio['Cashflow EUR'].loc[index]
                    ) / dfTWRRperiods.iloc[i - 1]['Market value EUR']
                else:
                    periodReturn = 1

            dfPortfolio['TWR %'].loc[index] = round((periodReturn - 1) * 100,2)
            dfPortfolio['TWR Norm'].loc[index] = round(periodReturn, 4)
            i = i + 1

        dfPortfolio['TWRCUM Norm'] = round(dfPortfolio['TWR Norm'].cumprod(), 4)
        errorLog = 'TWRCUM Norm: ' + str(dfPortfolio['TWRCUM Norm'])

        dfPortfolio['Taxes EUR'] = round((dfPortfolio['GainLoss EUR'] + dfPortfolio['Payouts EUR']) * (taxes / 100), 2)
        dfPortfolio['Taxes EUR'].fillna(0, inplace=True)

        return dfPortfolio

    except Exception as ex:
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        raise Exception('Error in generatePortfolioData(): ' + message + errorLog)


if __name__ == "__main__":
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))