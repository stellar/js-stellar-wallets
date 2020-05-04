import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Big from "big.js";

export const LUMENAUT_INFLATION_DESTINATION =
  "GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT";

export const RECOGNIZED_DESTINATIONS = {
  GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW: "StellarTerm",
};

export const MEMO_TYPES = {
  none: "none",
  text: "text",
  id: "id",
  hash: "hash",
  return: "return",
};

export const DESTINATION_NEEDS_MEMO = {
  // These ones we figured out ourselves.
  GASWJWFRYE55KC7MGANZMMRBK5NPXT3HMPDQ6SEXZN6ZPWYXVVYBFRTE: {
    name: "AnchorUSD",
    requiredMemoType: MEMO_TYPES.hash,
  },

  // List of destinations pulled from StellarTerm's directory.json
  // https://raw.githubusercontent.com/stellarterm/stellarterm/master/directory/directory.json
  GCEGERI7COJYNNID6CYSKS5DPPLGCCLPTOSCDD2LG5SJIVWM5ISUPERI: {
    name: "Superlumen Issuer",
    requiredMemoType: MEMO_TYPES.id,
  },
  GA5XIGA5C7QTPTWXQHY6MCJRMTRZDOSHR6EFIBNDQTCQHG262N4GGKTM: {
    name: "Kraken",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GCGNWKCJ3KHRLPM3TM6N7D3W5YKDJFL6A2YCXFXNMRTZ4Q66MEMZ6FI2: {
    name: "Poloniex",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GB6YPGW5JFMMP2QB2USQ33EUWTXVL4ZT5ITUNCY3YKVWOJPP57CANOF3: {
    name: "Bittrex",
    requiredMemoType: MEMO_TYPES.text,
    acceptedAssets: ["native"],
  },
  GB7GRJ5DTE3AA2TCVHQS2LAD3D7NFG7YLTOEWEBVRNUUI2Q3TJ5UQIFM: {
    name: "BTC38",
    requiredMemoType: MEMO_TYPES.id,
  },
  GBV4ZDEPNQ2FKSPKGJP2YKDAIZWQ2XKRQD4V4ACH3TCTFY6KPY3OAVS7: {
    name: "Changelly",
    requiredMemoType: MEMO_TYPES.id,
  },
  GBR3RS2Z277FER476OFHFXQJRKYSQX4Z7XNWO65AN3QPRUANUASANG3L: {
    name: "PapayaBot",
    requiredMemoType: MEMO_TYPES.text,
  },
  GBTBVILDGCOIK26EPEHYCMKM7J5MTQ4FD5DO37GVTTBP45TVGRAROQHP: {
    name: "KOINEX",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GBGVRE5DH6HGNYNLWQITKRQYGR4PWQEH6MOE5ELPY3I4XJPTZ7CVT4YW: {
    name: "PapayaSwap",
    requiredMemoType: MEMO_TYPES.text,
  },
  GBQWA6DU6OXHH4AVTFCONQ76LHEWQVZAW7SFSW4PPCAI2NX4MJDZUYDW: {
    name: "Piiko",
    requiredMemoType: MEMO_TYPES.text,
  },
  GBKTJSNUSR6OCXA5WDWGT33MNSCNQHOBQUBYC7TVS7BOXDKWFNHI4QNH: {
    name: "Exrates",
    requiredMemoType: MEMO_TYPES.text,
    acceptedAssets: ["native"],
  },
  GC4KAS6W2YCGJGLP633A6F6AKTCV4WSLMTMIQRSEQE5QRRVKSX7THV6S: {
    name: "Indodax",
    requiredMemoType: MEMO_TYPES.text,
    acceptedAssets: ["native"],
  },
  GCO2IP3MJNUOKS4PUDI4C7LGGMQDJGXG3COYX3WSB4HHNAHKYV5YL3VC: {
    name: "Binance",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A: {
    name: "Binance",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GBOEEVARKVASOQSSXCAHNTGJTVALJE2QM3AQQ2K3VXACQ6JJREQRJZKB: {
    name: "OKEX",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GDZCEWJ5TVXUTFH6V5CVDQDE43KRXYUFRHKI7X64EWMVOVYYZJFWIFQ2: {
    name: "AEX",
    requiredMemoType: MEMO_TYPES.id,
    acceptedAssets: ["native"],
  },
  GCXDR4QZ4OTVX6433DPTXELCSEWQ4E5BIPVRRJMUR6M3NT4JCVIDALZO: {
    name: "GOPAX",
    requiredMemoType: MEMO_TYPES.text,
  },
  GBZ35ZJRIKJGYH5PBKLKOZ5L6EXCNTO7BKIL7DAVVDFQ2ODJEEHHJXIM: {
    name: "XIM",
    acceptedAssets: ["native"],
  },
  GCZYLNGU4CA5NAWBAVTHMZH4JXWKP2OUJ6OK3I7XXZCNA5622WUJVLTG: {
    name: "RMT swap",
    acceptedAssets: [
      "RMT:GCVWTTPADC5YB5AYDKJCTUYSCJ7RKPGE4HT75NIZOUM4L7VRTS5EKLFN",
    ],
  },
  GBVUDZLMHTLMZANLZB6P4S4RYF52MVWTYVYXTQ2EJBPBX4DZI2SDOLLY: {
    name: "Pedity Issuer",
  },
  GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH: {
    name: "Mobius Issuer",
  },
  GDCHDRSDOBRMSUDKRE2C4U4KDLNEATJPIHHR2ORFL5BSD56G4DQXL4VW: {
    name: "StellarTerm Inflation",
  },
  GCCD6AJOYZCUAQLX32ZJF2MKFFAUJ53PVCFQI3RHWKL3V47QYE2BNAUT: {
    name: "Lumenaut Inflation",
  },
  GBTCBCWLE6YVTR5Y5RRZC36Z37OH22G773HECWEIZTZJSN4WTG3CSOES: {
    name: "NaoBTC",
    acceptedAssets: [
      "BTC:GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH",
    ],
  },
  GDRSWSKJCIB6Z65UA7W5RG62A7M5K3A5IHMED6DYHLPLWLVQCOOGDQ7S: {
    name: "Gate.io",
    requiredMemoType: MEMO_TYPES.id,
  },

  // From https://api.blockeq.com/directory/exchanges
  // Retrieved (and deduped/stripped) 2018-09-28
  GAWPTHY6233GRWZZ7JXDMVXDUDCVQVVQ2SXCSTG3R3CNP5LQPDAHNBKL: {
    name: "Bitfinex",
    requiredMemoType: MEMO_TYPES.text,
  },
  GB3RMPTL47E4ULVANHBNCXSXM2ZA5JFY5ISDRERPCXNJUDEO73QFZUNK: {
    name: "CEX.io",
    requiredMemoType: MEMO_TYPES.id,
  },
  GCKMUBVVU4VWUTIWJ3VHGGUTE2EVRIHW4HD5XMTTN5X2DVT5SAZ7MA4T: {
    name: "CoinEgg",
    requiredMemoType: MEMO_TYPES.id,
  },
  GCLDH6L6FBLTD3H3B23D6TIFVVTFBLZMNBC3ZOI6FGI5GPQROL4FOXIN: {
    name: "RippleFox",
    requiredMemoType: MEMO_TYPES.id,
  },
};
const El = styled.div`
  padding: 10px 0;

  &:last-of-type {
    border: none;
  }
`;

const TitleEl = styled.h3`
  font-size: 16px;
`;

const TYPE = {
  changeTrust: "changeTrust",
  manageOffer: "manageOffer",
  setOptions: "setOptions",
  createAccount: "createAccount",
  payment: "payment",
  // pathPayment: "pathPayment",
};

const TYPE_LABEL = {
  [TYPE.changeTrust]: `Trustline Change`,
  [TYPE.manageOffer]: `Manage Offer`,
  [TYPE.setOptions]: `Set Network Options`,
  [TYPE.createAccount]: `Fund a New Account`,
  [TYPE.payment]: `Make a Payment`,
  // [TYPE.pathPayment]: `Make a Path Payment`,
};

const OperationViewer = ({ type, ...props }) => {
  let knownAccountName;

  if (type === TYPE.setOptions && props.inflationDest) {
    if (DESTINATION_NEEDS_MEMO[props.inflationDest]) {
      knownAccountName = DESTINATION_NEEDS_MEMO[props.inflationDest].name;
    } else if (RECOGNIZED_DESTINATIONS[props.inflationDest]) {
      knownAccountName = RECOGNIZED_DESTINATIONS[props.inflationDest];
    }
  }

  return (
    <El>
      <TitleEl>{TYPE_LABEL[type] || type}</TitleEl>

      {type === TYPE.changeTrust && (
        <p>
          {parseInt(props.limit, 10) === 0 ? (
            <>
              Remove trustline to {props.line.code} ({props.line.issuer})
            </>
          ) : (
            <>
              Add trustline to {props.line.code} ({props.line.issuer})
            </>
          )}
        </p>
      )}

      {type === TYPE.manageOffer && (
        <Fragment>
          {props.selling.code === "REMOVE" ? (
            <p>
              <>Cancel offer #{props.offerId}</>
            </p>
          ) : (
            <p>
              <>
                Make a new offer, giving {props.amount} {props.selling.code} for{" "}
                {Big(props.amount)
                  .times(props.price)
                  .toPrecision(7)}
                {props.buying.code}
              </>
            </p>
          )}
        </Fragment>
      )}

      {type === TYPE.setOptions && (
        <Fragment>
          {props.inflationDest && (
            <p>
              {props.inflationDest === LUMENAUT_INFLATION_DESTINATION && (
                <>
                  Set your inflation destination to Lumenauts Inflation Pool and
                  get weekly airdrops into your account.
                </>
              )}
              {knownAccountName && (
                <>
                  Set your inflation destination to {knownAccountName} (
                  {props.inflationDest}).
                </>
              )}
              {props.inflationDest !== LUMENAUT_INFLATION_DESTINATION &&
                !knownAccountName && (
                  <>Set your inflation destination to {props.inflationDest}.</>
                )}
            </p>
          )}
        </Fragment>
      )}

      {type === TYPE.payment && (
        <Fragment>
          <p>
            <>
              Send {props.amount} {props.asset.code} to {props.destination}
            </>
          </p>
        </Fragment>
      )}

      {!TYPE[type] && <pre>{JSON.stringify(props, null, 2)}</pre>}
    </El>
  );
};

OperationViewer.propTypes = {
  type: PropTypes.string.isRequired,

  // changeTrust
  line: PropTypes.shape({
    code: PropTypes.string.isRequired,
    issuer: PropTypes.string.isRequired,
  }),
  limit: PropTypes.string,

  // manageOffer
  buying: PropTypes.shape({
    code: PropTypes.string.isRequired,
    issuer: PropTypes.string,
  }),
  selling: PropTypes.shape({
    code: PropTypes.string.isRequired,
    issuer: PropTypes.string,
  }),
  amount: PropTypes.string,
  price: PropTypes.string,
  offerId: PropTypes.string,

  // setOptions
  inflationDest: PropTypes.string,

  // payment
  // amount: PropTypes.string, // (already required above)
  destination: PropTypes.string,
  asset: PropTypes.shape({
    code: PropTypes.string.isRequired,
  }),
};

export default OperationViewer;
