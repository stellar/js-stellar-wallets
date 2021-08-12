import freighterApi from "@stellar/freighter-api";
import sinon from "sinon";
import { TransactionBuilder } from "stellar-sdk";
import { freighterHandler } from "./freighter";

describe("freighterHandler", () => {
  const XDR = "foo";
  const NETWORK = "baz";
  const SIGNED_TRANSACTION = "xxx";

  let freighterApiMock: sinon.SinonMock;
  let TransactionBuilderMock: sinon.SinonMock;
  beforeEach(() => {
    freighterApiMock = sinon.mock(freighterApi);
    TransactionBuilderMock = sinon.mock(TransactionBuilder);
  });
  afterEach(() => {
    freighterApiMock.verify();
    freighterApiMock.restore();
    TransactionBuilderMock.verify();
    TransactionBuilderMock.restore();
  });
  test("signTransaction is called with network", () => {
    freighterApiMock
      .expects("signTransaction")
      .once()
      .withArgs(XDR, NETWORK)
      .returns(Promise.resolve(SIGNED_TRANSACTION));
    TransactionBuilderMock.expects("fromXDR")
      .once()
      .withArgs(SIGNED_TRANSACTION)
      .returns(true);

    freighterHandler.signTransaction({
      // @ts-ignore
      transaction: { toXDR: () => XDR },
      // @ts-ignore
      key: { privateKey: "" },
      custom: { network: NETWORK },
    });
  });
  test("signTransaction is called without network", () => {
    freighterApiMock
      .expects("signTransaction")
      .once()
      .withArgs(XDR, undefined)
      .returns(Promise.resolve(SIGNED_TRANSACTION));
    TransactionBuilderMock.expects("fromXDR")
      .once()
      .returns(true);

    freighterHandler.signTransaction({
      // @ts-ignore
      transaction: { toXDR: () => XDR },
      // @ts-ignore
      key: { privateKey: "" },
    });
  });
  test("falsy config is passed as undefined to signTransaction", () => {
    freighterApiMock
      .expects("signTransaction")
      .once()
      .withArgs(XDR, undefined)
      .returns(Promise.resolve(SIGNED_TRANSACTION));
    TransactionBuilderMock.expects("fromXDR")
      .once()
      .withArgs(SIGNED_TRANSACTION)
      .returns(true);

    freighterHandler.signTransaction({
      // @ts-ignore
      transaction: { toXDR: () => XDR },
      // @ts-ignore
      key: { privateKey: "" },
      // @ts-ignore
      custom: false,
    });
  });
});
