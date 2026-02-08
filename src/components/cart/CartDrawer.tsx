"use client";

import { Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { X, Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { clsx } from "clsx";

export function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, subtotal } = useCart();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={closeCart}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-card shadow-xl border-l border-border">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-foreground uppercase tracking-widest">
                          Your Bag
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={closeCart}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                              <ShoppingBag className="w-16 h-16 text-muted-foreground/20" />
                              <p className="text-muted-foreground">Your bag is empty.</p>
                              <button
                                onClick={closeCart}
                                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-colors"
                              >
                                Continue Shopping
                              </button>
                            </div>
                          ) : (
                            <ul role="list" className="-my-6 divide-y divide-border">
                              {items.map((item) => (
                                <li key={item.id} className="flex py-6">
                                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={96}
                                      height={96}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-foreground">
                                        <h3>
                                          <Link href={`/products/${item.id}`} onClick={closeCart}>{item.name}</Link>
                                        </h3>
                                        <p className="ml-4 font-mono">${item.price * item.quantity}</p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center border border-border rounded-full">
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                          className="p-2 hover:text-primary transition-colors"
                                          disabled={item.quantity <= 1}
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="px-2 font-mono text-xs">{item.quantity}</span>
                                        <button
                                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                          className="p-2 hover:text-primary transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        className="font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 text-xs uppercase tracking-wider"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {items.length > 0 && (
                      <div className="border-t border-border px-4 py-6 sm:px-6 bg-muted/5">
                        <div className="flex justify-between text-base font-medium text-foreground mb-4">
                          <p className="uppercase tracking-widest text-sm">Subtotal</p>
                          <p className="font-mono text-lg">${subtotal}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground mb-6">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                          <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="flex w-full items-center justify-center rounded-full border border-transparent bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-300 uppercase tracking-widest"
                          >
                            Checkout <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                          <p>
                            or{' '}
                            <button
                              type="button"
                              className="font-medium text-primary hover:text-primary/80 transition-colors"
                              onClick={closeCart}
                            >
                              Continue Shopping
                              <span aria-hidden="true"> &rarr;</span>
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
