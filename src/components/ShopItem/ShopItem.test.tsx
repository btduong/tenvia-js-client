import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShopItem from "./ShopItem";

const onClickBuy = vi.fn();

describe('ShopIterm', () => {

    it('can render an item', async () => {

        render(
            <ShopItem name={"hammer"} price={1} count={1} icon={"/path/to/hammer"} onBuy={onClickBuy} />
        );
        expect(screen.getByText(/Buy/)).toBeInTheDocument();

        const buyButton = screen.getByRole('button' , { name: /Buy/ });
        await userEvent.click(buyButton);
        expect(onClickBuy).toHaveBeenCalled();
    });
});