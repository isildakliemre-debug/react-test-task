import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Menu, { Item as MenuItem } from 'rc-menu';
import Dropdown from 'rc-dropdown';
import clsx from 'clsx';
import debounce from 'lodash/debounce';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { StatusBlock } from '@/shared/ui/StatusBlock/StatusBlock';
import { loadRecipes, recipesActions } from './recipesSlice';

import styles from './RecipesPage.module.scss';
import 'rc-menu/assets/index.css';
import 'rc-dropdown/assets/index.css';
import useRecipesQuery from './query';

const pageSizeOptions=[
10,20,50
]

export function RecipesPage() {
  const [pageSelectorVisible, setPageSelectorVisible]= useState(false)
  const dispatch = useAppDispatch();
  const { page, pageSize, query } = useAppSelector((s) => s.recipes);
  const debouncedSetQuery = useMemo(
      () => debounce((value: string) => dispatch(recipesActions.setQuery(value)), 300),
      [dispatch],
  );
  const skip = (page - 1) * pageSize;
  const limit = pageSize;
  const {data, status, error } = useRecipesQuery({query, skip, limit})
  const items= data?.recipes ?? []
  const total= data?.total ?? 0

  useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const sortMenu = (
    <Menu
      onSelect={() => {
        // Intentionally a no-op.
        // Interview challenge: implement sorting via API or client-side.
      }}
    >
      <MenuItem key="name:asc">Name ↑ (TODO)</MenuItem>
      <MenuItem key="name:desc">Name ↓ (TODO)</MenuItem>
    </Menu>
  );

  const pageSizeSelector = (
    <Menu
      onSelect={(value) => dispatch(recipesActions.setPageSize(value.key as number))}
    >
      {pageSizeOptions.map(sizeOption=> (
         <MenuItem key={sizeOption}>{sizeOption}</MenuItem>
      ))
      }
    </Menu>
  );



  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          defaultValue={query}
          placeholder="Search recipes…"
          onChange={(e) => {
            // Intentionally does NOT trigger re-fetch. Candidate decides behavior.
            debouncedSetQuery(e.target.value);
          }}
        />

        <Dropdown overlay={sortMenu} trigger={['click']} >
          <button className={styles.sortBtn} type="button">
            Sort (TODO)
          </button>
        </Dropdown>

      <Dropdown overlay={pageSizeSelector} trigger={['click']} visible={pageSelectorVisible} onVisibleChange={(visible)=> setPageSelectorVisible(visible)}>
          <button type='button'>try</button>
      </Dropdown>
      </div>



      {status === 'pending' && (
        <StatusBlock variant="loading" title="Loading" description="Fetching recipes…" />
      )}

      {status === 'error' && (
        <StatusBlock
          variant="error"
          title="Error"
          description={error.message ?? 'Something went wrong'}
          action={
            <button type="button" onClick={() => dispatch(loadRecipes())}>
              Retry
            </button>
          }
        />
      )}

      {status === 'success' && items.length === 0 && (
        <StatusBlock variant="empty" title="No results" description="Try another search query." />
      )}

      {status === 'success' && items.length > 0 && (
        <>
          <ul className={styles.grid}>
            {items.map((r) => (
              <li key={r.id} className={clsx(styles.card)}>
                <Link to={`/recipes/${r.id}`} className={styles.cardLink}>
                  <img className={styles.image} src={r.image} alt={r.name} loading="lazy" />
                  <div className={styles.name}>{r.name}</div>
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.pager}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => dispatch(recipesActions.setPage(page - 1))}
            >
              Prev
            </button>
            <span className={styles.pageInfo}>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => dispatch(recipesActions.setPage(page + 1))}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
